---
title: Animal Rescue Platform
status: Draft
author: Engineering Team
created: 2026-06-04T20:27:17Z
target_release: TBD
tags: [design, prd, product]
id: prd-001
project_id: kaneer
doc_uuid: 5a3ff091-d731-40eb-8eb9-05e5f4989b01
---
<!-- markdown-link-check-disable -->
# Animal Rescue Platform

| Field | Value |
| --- | --- |
| **Author** | *[Fill in]* |
| **Status** | Draft |
| **Version** | 0.1 |
| **Last updated** | 2026-06-04 |
| **Reviewers / Stakeholders** | *[Fill in]* |

> [!NOTE]
> Sections with locked decisions are marked ✅. Open items are marked `[TODO]` or
> `> Fill in:`. Replace bracketed placeholders with specifics.

## 1. Overview

### 1.1 Problem Statement

Animals in distress are spotted by the public but there is no fast, centralized,
locality-aware way to report them and mobilize nearby rescuers.

### 1.2 Vision

A centralized, locality-based platform where any citizen can report an animal in need
and nearby rescuers can coordinate help in real time.

### 1.3 Goals

- *[TODO: Goal 1]*
- *[TODO: Goal 2]*
- *[TODO: Goal 3]*

### 1.4 Non-Goals (out of scope for v1)

- *[TODO: e.g., Donations/payments, vet appointment booking, adoption marketplace]*

### 1.5 Success Metrics

| Metric | Target | How measured |
| --- | --- | --- |
| Time-to-first-response on a report | *[TODO]* | *[TODO]* |
| % reports validated within X mins | *[TODO]* | *[TODO]* |
| % cases resolved | *[TODO]* | *[TODO]* |
| Active rescuers per locality | *[TODO]* | *[TODO]* |
| *[Add more]* |  |  |

## 2. Users & Personas

### 2.1 Roles & Permissions ✅

| Role | Capabilities | Granted by |
| --- | --- | --- |
| **Admin** (app team) | Create/manage locality groups, appoint moderators, manage users/bans, global oversight | System |
| **Moderator** (per group) | Validate reports + assign severity, post normal feed messages, pin/triage, verify closures, remove content | Admin |
| **Rescuer / Member** | Report animals, reply in threads with media, volunteer on cases, request closure | Self sign-up |
| **Guest** *(optional)* | *[TODO: read-only? not supported?]* | — |

### 2.2 Personas

- **Reporter** — *[Fill in: motivations, context, tech comfort]*
- **Rescuer / Volunteer** — *[Fill in]*
- **Moderator** — *[Fill in]*
- **Admin** — *[Fill in]*

## 3. Key Concepts & Information Architecture ✅

### 3.1 Group Hierarchy

```text
App
└── City  (e.g., Bangalore)
    └── Locality Group  (e.g., Koramangala)        ← admin-created
        ├── Sub-region  (e.g., Koramangala 5th Block) ← optional
        └── Feed (chat of reports + moderator messages)
            └── Report Thread (one per animal case)
                └── Replies (text / photo / video / audio / location)
```

### 3.2 Two Location Concepts ✅

- **Membership locality** — group(s) a user follows; GPS-*suggested*, user-confirmed,
  manually overridable.
- **Report locality** — captured per report (GPS + adjustable pin).
  Report routes to the locality of the **pin**, not the reporter’s home.

> [!NOTE]
> See sitemap diagram: *[link to Mermaid file / diagram #1]*

## 4. Core Decisions (Locked) ✅

| Decision | Resolution |
| --- | --- |
| Account model | Phone-number login (OTP), required to participate — design in [rfc-001](../rfcs/rfc-001-phone-otp-login.md) |
| Locality assignment | Hybrid: GPS-suggest + confirm + manual override; per-report location separate |
| Severity/urgency | Moderator-validated; fixed 3-tier; reporter may hint; mods can escalate |
| Resolution | Anyone requests closure + outcome; moderator verifies/approves |
| Moderation model | Two gates — validation in, verification out |

## 5. Features & Requirements

### 5.1 Onboarding & Auth ✅ / [TODO details]

- Phone number + OTP login.
  Design: [rfc-001](../rfcs/rfc-001-phone-otp-login.md) (provider, OTP format/expiry,
  retry/cooldown, session issuance).
- Locality onboarding (GPS suggest → confirm → manual override).
- *[TODO: profile fields required at signup?]*

### 5.2 Home Feed (chat-style)

- Each report = a feed entry/card; moderator messages interspersed.
- Card shows: thumbnail, severity badge, status, reply count, locality, time.
  *[TODO: confirm fields]*
- Unverified reports shown **greyed/muted** until validated.
  ✅
- Sorting/filtering: *[TODO: by severity? status? recency?]*

### 5.3 Report Composer

- Inputs: media (photo/video), location pin, animal type, condition, optional emergency
  hint + note. ✅
- *[TODO: required vs optional fields, media limits, animal type taxonomy]*

### 5.4 Report Thread / Detail

- Case header (status, severity, location, reporter) + chat replies with mixed media.
  ✅
- Actions: reply, “I am helping” (volunteer), request closure.
- *[TODO: who can see reporter contact info?]*

### 5.5 Severity & Triage (Gate 1) ✅

- Tiers: 🔴 Critical · 🟠 Urgent · 🟢 Routine.
  *[TODO: exact definitions]*
- Moderator triage queue of unverified reports.
- Reporter may flag “I think this is an emergency” as a hint.
- Severity is mutable (escalation logged).
  *[TODO: who can escalate besides mods?]*

### 5.6 Volunteering / Coordination

- “I am helping” sets case to Acknowledged → In Progress.
  ✅
- *[TODO: can multiple rescuers claim? assignment rules?]*

### 5.7 Closure & Verification (Gate 2) ✅

- Anyone requests closure with an **outcome reason** (+ optional proof).
- Outcome reasons: Rescued/Treated · Adopted/Rehomed · Released/Self-resolved · Deceased
  · False alarm/Duplicate.
- Moderator approves → Resolved/archived, or rejects → back to In Progress.
- Case stays visible/active while “Closure Requested.”
- *[TODO: is proof mandatory for any outcome?]*

### 5.8 Moderator Tools

- Triage queue, closure verification queue, post normal messages, pin, remove content.
  ✅
- *[TODO: bulk actions? mod-to-mod handoff?]*

### 5.9 Admin Panel (Web)

- Create/manage groups, define geo-boundaries, create sub-regions, appoint moderators,
  manage users/bans. ✅
- *[TODO: analytics dashboard? audit log viewer?]*

### 5.10 Notifications [TODO — open decision]

| Severity | Notification behavior (proposed) |
| --- | --- |
| Critical | Push to whole locality |
| Urgent | Push to opted-in rescuers |
| Routine | Feed only, no push |

> [!NOTE]
> Fill in: channels (push/SMS/email?), opt-in/out controls, quiet hours, thread-reply
> notifications.

## 6. Report Status Lifecycle ✅

```text
Submitted (Unverified)
   │  └─[mod rejects]→ Rejected / Spam / Duplicate
   ▼ [GATE 1: mod validates + assigns severity]
Validated → Acknowledged → In Progress
                              │
                              ▼ [anyone requests closure + outcome]
                     Closure Requested (Pending)
                        │              │
              [GATE 2 approve]   [GATE 2 reject]
                        ▼              └──→ back to In Progress
                    Resolved (archived)
```

> [!NOTE]
> Full diagrams: *[link to Mermaid lifecycle + flow diagrams]*

## 7. Data Model (high-level) ✅ / [TODO fields]

| Entity | Key fields |
| --- | --- |
| **User** | id, phone, name, role(s), home_locality, trust_score, *[TODO]* |
| **Group** | id, name, geo_boundary, parent_group, moderators[], *[TODO]* |
| **Report** | id, group_id, reporter_id, animal_type, condition, severity, location(lat/long + landmark), media[], status, emergency_hint, created_at, *[TODO]* |
| **Thread** | report_id, participants[], reply_count, last_activity |
| **Reply** | id, thread_id, author_id, body, media[], type, created_at |
| **AuditLog** | actor_id, action, target, reason, timestamp *[TODO: scope]* |

> [!NOTE]
> *[TODO: relationships, indexes, retention/archival policy]*

## 8. User Flows ✅

- **Flow A** — Report an animal
- **Flow B** — Rescuer responds
- **Flow C** — Moderator triage (Gate 1)
- **Flow D** — Closure verification (Gate 2)
- **Flow E** — Admin group setup

> [!NOTE]
> Diagrams: *[link to Mermaid file]*

## 9. Non-Functional Requirements [TODO]

- **Platforms:** *[mobile (iOS/Android)? web? PWA?]*
- **Performance:** *[feed load time, media upload limits]*
- **Offline behavior:** *[draft reports offline?]*
- **Localization / languages:** *[TODO]*
- **Accessibility:** *[TODO]*
- **Security & privacy:** *[phone number handling, location privacy, who sees what]*
- **Scalability:** *[expected groups/users per city]*

## 10. Edge Cases & Risks ✅ / [TODO]

- **Moderator availability** — critical case at 3am stalls behind validation gate.
  - Mitigations: multiple mods/group, “request urgent review” escalation,
    greyed-but-visible unverified reports.
- **Report routing across localities** — animal reported outside user’s home group
  routes by pin. *[TODO: confirm]*
- **Duplicate reports** for the same animal.
  *[TODO: dedup strategy?]*
- **Premature/abusive closure requests.** Mitigation: mod approval + audit log.
- *[TODO: add more]*

## 11. Open Questions

- [ ] Notifications: channels + opt-in rules (Section 5.10)
- [ ] Is proof mandatory for closure?
- [ ] Guest/read-only access supported?
- [ ] Animal type taxonomy (dogs only at launch?)
- [ ] *[TODO: add yours]*

## 12. Milestones / Phasing [TODO]

| Phase | Scope | Target |
| --- | --- | --- |
| MVP | *[TODO: must-have features]* | *[TODO]* |
| v1.1 | *[TODO]* | *[TODO]* |
| Later | *[TODO]* | *[TODO]* |

## 13. Appendix

- Mermaid diagrams (sitemap, lifecycle, flows A–E): *[link/path]*
- Glossary: *[TODO]*
- References: *[TODO]*
