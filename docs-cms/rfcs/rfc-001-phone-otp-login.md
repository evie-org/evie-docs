---
title: Phone Number OTP Login
status: Draft
author: Engineering Team
created: 2026-06-05T00:00:00Z
tags: [auth, design, rfc]
id: rfc-001
project_id: kaneer
doc_uuid: 88e7a7d8-6f2f-48b6-b474-8877a1854185
---
<!-- markdown-link-check-disable -->
# Summary

This RFC proposes *how* to implement phone-number login via one-time passcode (OTP), the
account model locked in [prd-001](../prds/prd-001-animal-rescue-platform.md) (§4, §5.1).
A user enters a phone number, receives a short numeric code over SMS, and submits it to
authenticate. The PRD settles *that* we use phone+OTP; this RFC settles the provider,
code format, expiry, retry/rate-limit rules, account-creation behavior, and session
issuance.

# Motivation

The platform requires every participant to be reachable and lightly verified: rescuers
coordinate in real time, and moderation/bans must bind to a stable identity.
A phone number is the natural anchor — it doubles as a contact channel and a weak proof
of uniqueness, with no passwords to manage or reset.

Open items this RFC closes (from prd-001 §5.1):

- OTP provider choice.
- Retry / cooldown / rate-limit rules.
- Whether sign-in and sign-up are the same flow (and what profile fields, if any, are
  required at first login).

Expected outcome: a single, secure phone→OTP→session flow that works for both new and
returning users.

# Conventions Assumed

This RFC is the first feature design in the project, so it necessarily *surfaces*
several choices that are not auth-specific — they will govern every future endpoint.
They are stated here provisionally and should be ratified in a platform-conventions
**ADR** once a second feature (rfc-002) confirms the pattern; until then, treat them as
proposed, not settled:

- **Transport** — REST-style JSON over HTTP.
- **Endpoint namespace / versioning** — paths shown unversioned (`/auth/...`); whether
  to adopt a `/v1` prefix is an open convention, not an auth decision.
- **Session model** — JWT access token + rotating, server-stored refresh token (see
  *Session issuance*). This is app-wide: every authenticated endpoint depends on it, so
  it is the strongest candidate to lift into an ADR.
- **Field casing** — `snake_case` in request/response bodies.

The *auth-specific* endpoint names and payloads below (e.g. `/auth/otp/verify`) are
proposed by this RFC and are considered approved when the RFC is approved — they need no
prior document.

# Detailed Design

## Flow overview

```text
1. Client POST /auth/otp/request { phone }           → 200 { challenge_id, expires_at }
2. Provider sends 6-digit code via SMS
3. Client POST /auth/otp/verify  { challenge_id, code } → 200 { access_token, refresh_token, is_new_user }
4. If is_new_user, client routes into locality onboarding (prd-001 §5.1)
```

Sign-in and sign-up are the **same flow**. `/auth/otp/verify` creates the `User` record
on first successful verification (status = pending profile) and returns
`is_new_user: true`; no separate registration endpoint.
Required profile fields are collected *after* verification during locality onboarding,
not before, to keep the auth step frictionless.

## OTP parameters

| Parameter | Value | Rationale |
| --- | --- | --- |
| Code length | 6 digits | Standard; ~1M space, paired with attempt limits |
| Code TTL | 5 minutes | Long enough for SMS latency, short enough to limit replay |
| Codes per challenge | 1 (re-request invalidates prior) | Avoids ambiguous multi-code state |
| Verify attempts | 5 per challenge, then challenge locked | Caps online brute force to 5/1M |
| Delivery | SMS only (v1) | Matches PRD; WhatsApp/voice deferred |

Codes are generated with a cryptographically secure RNG. Only a **hash** of the code is
stored server-side (e.g. HMAC-SHA256 with a server pepper); the plaintext exists only in
the SMS payload. Verification compares hashes in constant time.

## Provider

Proposal: use a dedicated programmable-SMS provider behind a thin internal interface
(`OtpSender`) so the vendor is swappable.
**Twilio Verify** is the recommended default — it manages code generation, delivery,
retries, and fraud signals, reducing what we build and store.
The provider decision is significant and long-lived; once chosen it should be recorded
in an **ADR** referencing this RFC.

> Fill in: confirm Twilio Verify vs.
> self-managed codes + raw SMS (Twilio/Plivo/MSG91). India deliverability and
> DLT/sender-ID registration are decisive factors and need a spike.
> See Unresolved Questions.

## Rate limiting & abuse controls

Layered limits, keyed independently so one axis can’t be bypassed by varying another:

| Limit | Scope | Threshold (proposed) |
| --- | --- | --- |
| Request OTP | per phone | 1 / 30s, 5 / hour, 10 / day |
| Request OTP | per IP | 20 / hour |
| Request OTP | per device | 10 / day |
| Verify | per challenge | 5 attempts (then locked) |
| Global | per phone | progressive backoff after repeated failures |

A resend uses a cooldown (30s) and counts against the per-phone hourly cap.
Abusive numbers/IPs can be soft-blocked; repeat offenders surface to Admin (prd-001
§2.1).

## Session issuance

On successful verify, issue a short-lived **access token** (JWT, ~15 min) plus a
long-lived **refresh token** (opaque, server-stored, rotating on use, revocable).
Refresh tokens bind to a device record so Admin bans and user-initiated “sign out
everywhere” can revoke them.
Token claims carry `user_id` and `role(s)` to drive authorization (Admin / Moderator /
Rescuer per prd-001 §2.1).

## API Changes

New endpoints:

- `POST /auth/otp/request` — `{ phone }` → `{ challenge_id, expires_at, resend_after }`
- `POST /auth/otp/verify` — `{ challenge_id, code }` →
  `{ access_token, refresh_token, is_new_user }`
- `POST /auth/token/refresh` — `{ refresh_token }` → rotated token pair
- `POST /auth/logout` — revokes the presented refresh token (optionally all devices)

## Data Model Changes

Extends prd-001 §7:

- **User** — add `phone_verified_at`, `status` (`pending_profile` | `active` |
  `banned`). `phone` is unique and stored in E.164.
- **OtpChallenge** (new, ephemeral) — `id`, `phone`, `code_hash`, `expires_at`,
  `attempts`, `consumed_at`, `created_ip`.
- **Device / RefreshToken** (new) — `id`, `user_id`, `token_hash`, `device_label`,
  `created_at`, `last_used_at`, `revoked_at`.

`OtpChallenge` rows are short-lived and purged after expiry + a small grace window.

## Migration Strategy

Greenfield — no existing accounts to migrate.
The `OtpChallenge` and `RefreshToken` tables are net-new.
Phone numbers are normalized to E.164 on entry so no later backfill is required.

# Drawbacks

- **SMS cost and deliverability**, especially in India where carrier delivery, DLT
  template registration, and latency are real friction.
  SMS is also the line item that scales with abuse, so rate-limiting quality directly
  affects spend.
- **Phone numbers are recycled** — a reassigned number could inherit a prior identity.
  Mitigated by re-verification on new devices and ban-by-account, not just by number.
- **SIM-swap / SMS-interception** risk; OTP-over-SMS is “weak 2FA.” Acceptable for v1’s
  threat model (community animal reports), revisit if privileged roles need stronger
  auth.
- **No password fallback** — users without SMS access in the moment cannot log in.
  A voice-OTP or WhatsApp channel is a future mitigation.

# Alternatives

- **Self-managed codes + raw SMS** (we generate/store hashed codes, provider only
  delivers). More control and lower per-message cost; more security surface we own.
  Viable if Verify’s pricing or coverage disappoints.
- **Email magic links** — rejected: weaker contact guarantee for real-time rescue
  coordination, and the PRD locked phone as the account anchor.
- **OAuth / social login** — rejected: doesn’t establish a reachable phone, adds
  third-party dependency, weaker uniqueness signal.
- **Passwords** — rejected: reset burden, reuse/breach risk, no contact-channel benefit.
- **Do nothing** — not an option; auth is a launch blocker.

# Adoption Strategy

This is the only authentication path at launch, so adoption is implicit — every user
hits it on first run.
No existing users to migrate.
Client work: a two-screen flow (enter number → enter code) plus resend/cooldown UI
states.

# Unresolved Questions

- Provider: Twilio Verify vs.
  self-managed + raw SMS (Plivo/MSG91) — needs an India deliverability + DLT spike.
  Decision to be captured in a follow-up ADR.
- Exact rate-limit thresholds — the table above is a starting proposal pending load and
  abuse modeling.
- Access-token lifetime and refresh-rotation policy specifics.
- Is a non-SMS fallback (voice/WhatsApp) in scope for v1 or deferred?

# Future Possibilities

- WhatsApp or voice-call OTP as alternate channels.
- Device trust / “remember this device” to reduce re-verification.
- Step-up auth (stronger factor) for Admin/Moderator actions.
- Optional passkeys once accounts are established.
