---
title: Phone Number OTP Login
status: Accepted
author: Engineering Team
created: 2026-06-05T00:00:00Z
tags: [auth, design, rfc]
id: rfc-001
project_id: kaneer
doc_uuid: 88e7a7d8-6f2f-48b6-b474-8877a1854185
---
<!-- markdown-link-check-disable -->
> **Amended by [adr-001](../adrs/adr-001-firebase-phone-verification.md) (2026-07, implemented).**
> Phone verification is delegated to **Firebase** (verification only — we still issue our
> own sessions).
> **Superseded by the ADR:** the flow overview, §OTP parameters, §Provider, the OTP
> request-side limits in §Rate limiting, the `/auth/otp/*` endpoints in §API Changes, the
> `OtpChallenge` entity in §Data Model Changes, and the §Adoption Strategy rollout — DLT
> registration is no longer a launch gate.
> **Retained unchanged:** the account model (sign-in = sign-up, `is_new_user`,
> post-verification onboarding), **§Session issuance in full** (the reason the hybrid model
> was chosen), and the accepted tradeoffs in §Drawbacks.
> Superseded sections are marked inline and kept for historical rationale; the implemented
> design lives in the ADR and the `evie-services/evie-auth` README.

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

> **Superseded by adr-001** — the client now verifies the phone with the Firebase SDK and
> exchanges the resulting ID token at `POST /auth/session`; steps 1–3 below describe the
> pre-Firebase design. The account-model paragraph after the diagram still holds
> (`is_new_user` is returned by `/auth/session`).

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

> **Superseded by adr-001** — Firebase owns code generation, delivery, expiry, and attempt
> limits end to end; none of the parameters below are ours to set anymore.

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

**Brute-force ceiling.** The 5-attempt lock is *per challenge*; re-requesting issues a
new challenge with a fresh attempt budget, so the per-challenge lock alone does **not**
bound total guesses. The real ceiling comes from the per-phone *request* cap acting with
it: at most 10 codes/day × 5 attempts = 50 guesses/day against a 1,000,000-code space,
i.e. P(hit) ≤ 50/1e6 ≈ **0.005%/day per phone**. The per-challenge lock and the per-phone
request cap are load-bearing *together* — neither is sufficient alone, so both are
required for the ceiling to hold.

## Provider

> **Superseded by adr-001** — the provider decision landed: **Firebase Phone Auth,
> verification only**. The `OtpSender` design below (and its `console|allowlist|sms` beta
> plan) was implemented as a scaffold but never shipped; self-managed codes + raw SMS
> remains the documented fallback if Firebase pricing, India deliverability, or data
> residency disappoints.

Proposal: use a dedicated programmable-SMS provider behind a thin internal interface
(`OtpSender`) so the vendor is swappable.
**Twilio Verify** is the recommended default — it manages code generation, delivery,
retries, and fraud signals, reducing what we build and store.
The provider decision is significant and long-lived; once chosen it should be recorded
in an **ADR** referencing this RFC.

**MVP / closed beta (decided):** no SMS provider is wired up yet. `OtpSender` ships with
three implementations selected by server-side config (`OTP_SENDER=console|allowlist|sms`):

- `console` — local dev only; code is logged server-side.
- `allowlist` — **the beta mode.** Only allowlisted tester phone numbers may request
  OTPs. The code is generated, hashed, and verified *exactly* as in production — only
  **delivery** is stubbed: the fresh code is surfaced to the tester out-of-band (returned
  to the allowlisted caller / a dev channel) instead of over SMS. Non-allowlisted numbers
  receive the same generic response as a rate-limited request (no enumeration). All
  attempt limits and rate limits stay active. Because only the delivery seam differs, the
  generation → verify → data path is the production path unchanged; and because no SMS is
  sent, the beta runs with **no DLT registration**. This is a pure `OtpSender` swap, which
  is why going to production is a config flip, not a code change.
- `sms` — production; requires the provider decision below and completed DLT
  registration.

The verify path, data model, and endpoints are identical across modes — going to
production is a config flip, not a code change.

## Rate limiting & abuse controls

> **Partially superseded by adr-001** — OTP request-side abuse (the table below) is now
> Firebase's concern (reCAPTCHA attestation; App Check enforcement is an ADR open item).
> What remains ours is rate limiting on `/auth/session` and `/auth/token/refresh`, which
> lands in the planned **proxy/gateway** service in front of all evie services — evie-auth
> itself stays middleware-free by design.

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

**Production hardening (gated on `OTP_SENDER=sms`).** Before public SMS launch, add
request-side defenses the allowlist beta does not need: CAPTCHA or app attestation on
`/auth/otp/request`, and a **global daily SMS-spend circuit-breaker** that trips the
sender to a safe mode when spend crosses a threshold — SMS is the line item that scales
directly with abuse, so a hard spend ceiling caps the blast radius of any bypass.

## Session issuance

> **Retained by adr-001 and implemented** — this section is why the hybrid model was
> chosen. Live in `evie-auth`: 15-min HS256 access JWT (claims: `sub`, `roles`) + 30-day
> rotating refresh token; reuse → family revoke is specified here and still pending in code.

On successful verify, issue a short-lived **access token** (JWT, ~15 min) plus a
long-lived **refresh token** (opaque, server-stored, rotating on use, revocable).
Refresh tokens bind to a device record so Admin bans and user-initiated “sign out
everywhere” can revoke them.
Rotation is mandatory: each refresh revokes the presented token and issues a new pair.
**Reuse of an already-rotated (revoked) refresh token is treated as a theft signal** — it
revokes the entire token family for that session, forcing re-authentication, since a
legitimate client never replays a rotated token.
Token claims carry `user_id` and `role(s)` to drive authorization (Admin / Moderator /
Rescuer per prd-001 §2.1).

## API Changes

> **Superseded by adr-001** — the two OTP endpoints are replaced by a single
> `POST /auth/session` `{ firebase_id_token }` → `{ access_token, refresh_token,
> is_new_user }`; refresh and logout are unchanged and implemented as specified.

New endpoints:

- `POST /auth/otp/request` — `{ phone }` → `{ challenge_id, expires_at, resend_after }`
- `POST /auth/otp/verify` — `{ challenge_id, code }` →
  `{ access_token, refresh_token, is_new_user }`
- `POST /auth/token/refresh` — `{ refresh_token }` → rotated token pair
- `POST /auth/logout` — revokes the presented refresh token (optionally all devices)

## Data Model Changes

> **Amended by adr-001** — `OtpChallenge` is removed (Firebase owns code state); `User`
> additionally gains `firebase_uid` (unique identity binding) and `role`
> (`user` | `moderator` | `admin`, default `user`; elevation is an out-of-band admin
> action). `Device / RefreshToken` is unchanged.

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
  The residual risk is **explicitly accepted for v1's threat model** (community animal
  reports); revisit if privileged roles or higher-trust actions are added.
- **`is_new_user` leaks prior registration** — the verify response reveals whether a
  number already had an account, an account-enumeration signal. The leak is bounded: it
  reaches only a caller who has *already* passed OTP verification for that number (i.e.
  someone controlling the phone). Accepted for v1 to keep onboarding routing simple;
  revisit if enumeration becomes a concern.
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

> **Superseded by adr-001** — beta and production share one Firebase path (test phone
> numbers / emulator vs. live SMS); the staged sender rollout and DLT gate below no longer
> apply. The client work estimate still holds.

This is the only authentication path at launch, so adoption is implicit — every user
hits it on first run.
No existing users to migrate.
Rollout order: closed beta on the `allowlist` sender (no SMS dependency) → DLT
registration + provider bake-off in parallel → flip `OTP_SENDER=sms` for public launch.
Client work: a two-screen flow (enter number → enter code) plus resend/cooldown UI
states.

# Unresolved Questions

- ~~**Entity for DLT (launch gate):**~~ **Resolved by [adr-001](../adrs/adr-001-firebase-phone-verification.md):**
  Firebase delivers the SMS, so DLT Principal-Entity registration is no longer a launch
  gate. The remaining entity need is a Google Cloud **billing** account (a payment method),
  not DLT. Original text retained for history: we have no Indian business entity, and DLT
  registration would have required one (sole proprietorship + GST, per a CA).
- ~~Provider: Twilio Verify vs. self-managed + raw SMS~~ **Resolved by
  [adr-001](../adrs/adr-001-firebase-phone-verification.md):** Firebase Phone Auth
  (verification only). Self-managed + raw SMS is retained as the documented fallback;
  Firebase-specific open items (India deliverability/pricing at scale, App Check
  enforcement, data residency) are tracked in the ADR.
- Rate limiting on `/auth/session` + `/auth/token/refresh` — thresholds and enforcement
  live in the planned proxy/gateway service; to be settled in that service's design doc.

*Resolved in this revision:* access-token lifetime + refresh-rotation policy (15m access /
30d refresh, mandatory rotation with reuse-detection → family revoke — see §Session
issuance); non-SMS fallback (voice/WhatsApp) is **deferred**, out of scope for v1 (see
Future Possibilities).

# Future Possibilities

- WhatsApp or voice-call OTP as alternate channels.
- Device trust / “remember this device” to reduce re-verification.
- Step-up auth (stronger factor) for Admin/Moderator actions.
- Optional passkeys once accounts are established.
