---
id: adr-001
project_id: kaneer
doc_uuid: f9b00a57-17a2-4e0f-a23d-a8e52445cc99
title: Firebase for phone verification, self-issued sessions
tags: [architecture, decision, auth]
status: Implemented
created: 2026-07-11T00:00:00Z
deciders:
    - Engineering Team
---
<!-- markdown-link-check-disable -->
# ADR-001: Firebase for phone verification, self-issued sessions

### Status

Implemented — amends [rfc-001](../rfcs/rfc-001-phone-otp-login.md). The self-managed OTP
design in rfc-001 §OTP parameters / §Provider is **superseded** by this ADR; rfc-001
§Session issuance is **retained unchanged**.
Verified end-to-end on 2026-07-11 in `evie-services/evie-auth`: real SMS → Firebase
verification → `POST /v1/auth/session` → own access/refresh tokens (operational field
notes in that service's README). Still pending in code: refresh-reuse **family revoke**
and the Postgres store.

## Context

rfc-001 settled phone→OTP→session as the account model and proposed a *self-managed*
OTP implementation: our backend generates, hashes, stores, and verifies codes, with a
programmable-SMS provider (Twilio Verify / MSG91) behind a thin `OtpSender` seam.

That design has one hard external gate: **India DLT registration**, which requires an
Indian business entity we do not yet have (rfc-001 §Unresolved Questions). Production SMS
is blocked on it, and the provider bake-off can only run after it completes. It is the
only launch-blocking clock on the project.

The question this ADR settles: *who verifies the phone number*, and *who owns the
session*. These are separable, and separating them is the whole decision.

## Decision

Adopt **Firebase Phone Authentication for verification only, with self-issued
sessions** (the "hybrid" model):

1. The client performs phone verification entirely through the Firebase SDK — Firebase
   sends the SMS, collects the code, and returns a **Firebase ID token** (RS256 JWT,
   ~1h lifetime).
2. The client presents that token **once** to our backend at a new endpoint,
   `POST /auth/session { firebase_id_token }`.
3. The backend **verifies** the token, upserts the user by phone, and issues **our own**
   access + refresh tokens. Firebase is out of the loop from this point on — all
   subsequent auth uses our tokens.

Firebase is thus the *phone-proof provider*, nothing more. It replaces our OTP
generation and delivery; it does **not** replace our session model.

### What this retains from rfc-001 (unchanged)

- **§Session issuance in full**: our HS256 access token + opaque, server-stored,
  **rotating** refresh token, with **reuse-detection → family revoke**, device binding,
  and server-side revocation (Admin bans, "sign out everywhere").
- The `user` / `moderator` / `admin` role model, carried in our access-token claims.
  Elevation stays an out-of-band admin action — never a login path.
- `POST /auth/token/refresh` and `POST /auth/logout`, unchanged.

### What this removes from rfc-001

- Self-managed OTP internals: code generation/hashing, the `OtpSender` seam, the
  `console|allowlist|sms` config switch, and the allowlist beta sender.
- `POST /auth/otp/request` and `POST /auth/otp/verify` — replaced by
  `POST /auth/session`.
- The `OtpChallenge` entity/table (Firebase owns code state).
- Most OTP request-side rate limiting (per-phone/IP/device OTP caps) — Firebase enforces
  these, with App Check / reCAPTCHA for abuse. We retain rate limiting on
  `/auth/session` and `/auth/token/refresh`, enforced in the planned **proxy/gateway**
  service that fronts all evie services (evie-auth itself is issuance-only and
  middleware-free by design).

### Token verification (security-critical)

`POST /auth/session` MUST verify the Firebase ID token using the Firebase Admin SDK
(do not hand-roll), enforcing **all** of:

- Signature valid against Google's rotating public keys; `alg == RS256`.
- `aud == <firebase-project-id>` and `iss == https://securetoken.google.com/<project>`.
- `exp`, `iat`, and `auth_time` are valid (token not expired / not future-dated).
- **`firebase.sign_in_provider == "phone"` and a non-empty `phone_number` claim is
  present.** Without this check, a Google/email/anonymous Firebase token from the same
  project would mint a session with no phone proof — this is the load-bearing check.
- The account is bound to the token's stable `firebase_uid`; `phone_number` (E.164) is
  the human-facing anchor.

The token is exchanged exactly once for our session, so a stolen ID token has a bounded
(~1h) window and cannot be replayed after exchange.

### Data model delta (vs rfc-001 §Data Model Changes)

- **User** — add `firebase_uid` (unique, stable identity binding) and `role`
  (`user` default). `phone_verified_at` is now sourced from the verified token rather
  than a local challenge. `phone` remains unique, E.164.
- **OtpChallenge** — **removed.**
- **Device / RefreshToken** — unchanged.

### Beta vs production

Beta/dev and production now share **one** code path (restoring rfc-001's "config flip,
not a code change" property, now via Firebase rather than our own seam):

- **Dev / closed beta** — Firebase **test phone numbers** (fixed codes, no SMS) or the
  Firebase Auth Emulator. No live SMS, no DLT.
- **Production** — live Firebase SMS. Still **no DLT on our side** — Google delivers.

## Consequences

**Positive**

- **DLT leaves the critical path.** Google delivers the SMS, so Principal-Entity/DLT
  registration is no longer a launch gate. The entity/CA task drops from "launch
  blocker" to "needed for a Google Cloud **billing** account" (a payment method, not
  DLT).
- We build and own far less: no code generation/storage, no SMS integration, no
  OTP-request abuse controls, no `OtpChallenge` lifecycle.
- The session model, roles, rotation, reuse-detection, and revocation — the parts we
  most want control over — are untouched.
- Beta and production converge on one flow.

**Negative / tradeoffs**

- **Hard Firebase dependency.** A Firebase outage means no *new* logins; existing
  sessions keep refreshing on our side (our refresh tokens are independent of Firebase).
- The client is bound to the Firebase SDK for the verification step.
- New cost + abuse surface: Firebase Phone Auth is billed per verification and is a
  toll-fraud (SMS-pumping) target; mitigation requires enforcing App Check / reCAPTCHA.
- **Data residency**: Firebase stores phone numbers; this must be acceptable under our
  privacy posture.
- The working allowlist-beta code from the rfc-001 scaffold becomes throwaway for the
  production path (usable as a local stand-in only until Firebase is wired).

## Alternatives Considered

- **Full Firebase Auth (Firebase owns identity *and* sessions).** Rejected: it discards
  rfc-001 §Session issuance — our server-stored rotating refresh tokens, reuse-detection,
  device binding, and own revocation — and pushes roles into Firebase custom claims
  (which propagate with up to ~1h lag). Too much of the deliberately-chosen session model
  is given up.
- **Self-managed OTP + raw SMS (the original rfc-001 design; Twilio Verify / MSG91).**
  Deferred, not rejected outright: it remains the fallback if Firebase pricing, India
  deliverability, or data-residency constraints disappoint. Its blocker (DLT) is exactly
  what this ADR routes around.
- **Email magic links / OAuth / passwords.** Already rejected in rfc-001 §Alternatives;
  unchanged.

## Related Resources

- [rfc-001 — Phone Number OTP Login](../rfcs/rfc-001-phone-otp-login.md) (amended by this ADR)
- [rfc-003 — Platform Conventions](../rfcs/rfc-003-platform-conventions.md) (session/JWT model)
- prd-001 §5.1 (account model), §2.1 (roles)

### Open items (tracked, not blocking this decision)

- Validate Firebase **India deliverability + latency** and **pricing at scale** (replaces
  the old Twilio-vs-MSG91 bake-off). First real +91 delivery confirmed 2026-07-11; scale
  behavior unknown.
- Enforcement plan for **App Check / reCAPTCHA** against SMS toll fraud.
- **Data-residency / privacy** review for Firebase-stored phone numbers.
- ~~Google Cloud **billing account** for production Firebase~~ — **done 2026-07-11**
  (Blaze plan enabled; SMS region policy restricted to India).
