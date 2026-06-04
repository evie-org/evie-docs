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
|-------|-------|
| **Author** | _[Fill in]_ |
| **Status** | Draft |
| **Version** | 0.1 |
| **Last updated** | 2026-06-04 |
| **Reviewers / Stakeholders** | _[Fill in]_ |

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

- _[TODO: Goal 1]_
- _[TODO: Goal 2]_
- _[TODO: Goal 3]_

### 1.4 Non-Goals (out of scope for v1)

- _[TODO: e.g., Donations/payments, vet appointment booking, adoption marketplace]_

### 1.5 Success Metrics

| Metric | Target | How measured |
|--------|--------|--------------|
| Time-to-first-response on a report | _[TODO]_ | _[TODO]_ |
| % reports validated within X mins | _[TODO]_ | _[TODO]_ |
| % cases resolved | _[TODO]_ | _[TODO]_ |
| Active rescuers per locality | _[TODO]_ | _[TODO]_ |
| _[Add more]_ | | |

## 2. Users & Personas

### 2.1 Roles & Permissions ✅

| Role | Capabilities | Granted by |
|------|--------------|-----------|
| **Admin** (app team) | Create/manage locality groups, appoint moderators, manage users/bans, global oversight | System |
| **Moderator** (per group) | Validate reports + assign severity, post normal feed messages, pin/triage, verify closures, remove content | Admin |
| **Rescuer / Member** | Report animals, reply in threads with media, volunteer on cases, request closure | Self sign-up |
| **Guest** _(optional)_ | _[TODO: read-only? not supported?]_ | — |

### 2.2 Personas

- **Reporter** — _[Fill in: motivations, context, tech comfort]_
- **Rescuer / Volunteer** — _[Fill in]_
- **Moderator** — _[Fill in]_
- **Admin** — _[Fill in]_

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
- **Report locality** — captured per report (GPS + adjustable pin). Report routes to the
  locality of the **pin**, not the reporter's home.

> [!NOTE]
> See sitemap diagram: _[link to Mermaid file / diagram #1]_

## 4. Core Decisions (Locked) ✅

| Decision | Resolution |
|----------|-----------|
| Account model | Phone-number login (OTP), required to participate |
| Locality assignment | Hybrid: GPS-suggest + confirm + manual override; per-report location separate |
| Severity/urgency | Moderator-validated; fixed 3-tier; reporter may hint; mods can escalate |
| Resolution | Anyone requests closure + outcome; moderator verifies/approves |
| Moderation model | Two gates — validation in, verification out |

## 5. Features & Requirements

### 5.1 Onboarding & Auth ✅ / [TODO details]

- Phone number + OTP login. _[TODO: OTP provider? retry/cooldown rules?]_
- Locality onboarding (GPS suggest → confirm → manual override).
- _[TODO: profile fields required at signup?]_

### 5.2 Home Feed (chat-style)

- Each report = a feed entry/card; moderator messages interspersed.
- Card shows: thumbnail, severity badge, status, reply count, locality, time. _[TODO: confirm fields]_
- Unverified reports shown **greyed/muted** until validated. ✅
- Sorting/filtering: _[TODO: by severity? status? recency?]_

### 5.3 Report Composer

- Inputs: media (photo/video), location pin, animal type, condition, optional emergency
  hint + note. ✅
- _[TODO: required vs optional fields, media limits, animal type taxonomy]_

### 5.4 Report Thread / Detail

- Case header (status, severity, location, reporter) + chat replies with mixed media. ✅
- Actions: reply, "I am helping" (volunteer), request closure.
- _[TODO: who can see reporter contact info?]_

### 5.5 Severity & Triage (Gate 1) ✅

- Tiers: 🔴 Critical · 🟠 Urgent · 🟢 Routine. _[TODO: exact definitions]_
- Moderator triage queue of unverified reports.
- Reporter may flag "I think this is an emergency" as a hint.
- Severity is mutable (escalation logged). _[TODO: who can escalate besides mods?]_

### 5.6 Volunteering / Coordination

- "I am helping" sets case to Acknowledged → In Progress. ✅
- _[TODO: can multiple rescuers claim? assignment rules?]_

### 5.7 Closure & Verification (Gate 2) ✅

- Anyone requests closure with an **outcome reason** (+ optional proof).
- Outcome reasons: Rescued/Treated · Adopted/Rehomed · Released/Self-resolved · Deceased ·
  False alarm/Duplicate.
- Moderator approves → Resolved/archived, or rejects → back to In Progress.
- Case stays visible/active while "Closure Requested."
- _[TODO: is proof mandatory for any outcome?]_

### 5.8 Moderator Tools

- Triage queue, closure verification queue, post normal messages, pin, remove content. ✅
- _[TODO: bulk actions? mod-to-mod handoff?]_

### 5.9 Admin Panel (Web)

- Create/manage groups, define geo-boundaries, create sub-regions, appoint moderators,
  manage users/bans. ✅
- _[TODO: analytics dashboard? audit log viewer?]_

### 5.10 Notifications [TODO — open decision]

| Severity | Notification behavior (proposed) |
|----------|----------------------------------|
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
> Full diagrams: _[link to Mermaid lifecycle + flow diagrams]_

## 7. Data Model (high-level) ✅ / [TODO fields]

| Entity | Key fields |
|--------|-----------|
| **User** | id, phone, name, role(s), home_locality, trust_score, _[TODO]_ |
| **Group** | id, name, geo_boundary, parent_group, moderators[], _[TODO]_ |
| **Report** | id, group_id, reporter_id, animal_type, condition, severity, location(lat/long + landmark), media[], status, emergency_hint, created_at, _[TODO]_ |
| **Thread** | report_id, participants[], reply_count, last_activity |
| **Reply** | id, thread_id, author_id, body, media[], type, created_at |
| **AuditLog** | actor_id, action, target, reason, timestamp _[TODO: scope]_ |

> [!NOTE]
> _[TODO: relationships, indexes, retention/archival policy]_

## 8. User Flows ✅

- **Flow A** — Report an animal
- **Flow B** — Rescuer responds
- **Flow C** — Moderator triage (Gate 1)
- **Flow D** — Closure verification (Gate 2)
- **Flow E** — Admin group setup

> [!NOTE]
> Diagrams: _[link to Mermaid file]_

## 9. Non-Functional Requirements [TODO]

- **Platforms:** _[mobile (iOS/Android)? web? PWA?]_
- **Performance:** _[feed load time, media upload limits]_
- **Offline behavior:** _[draft reports offline?]_
- **Localization / languages:** _[TODO]_
- **Accessibility:** _[TODO]_
- **Security & privacy:** _[phone number handling, location privacy, who sees what]_
- **Scalability:** _[expected groups/users per city]_

## 10. Edge Cases & Risks ✅ / [TODO]

- **Moderator availability** — critical case at 3am stalls behind validation gate.
  - Mitigations: multiple mods/group, "request urgent review" escalation, greyed-but-visible
    unverified reports.
- **Report routing across localities** — animal reported outside user's home group routes
  by pin. _[TODO: confirm]_
- **Duplicate reports** for the same animal. _[TODO: dedup strategy?]_
- **Premature/abusive closure requests.** Mitigation: mod approval + audit log.
- _[TODO: add more]_

## 11. Open Questions

- [ ] Notifications: channels + opt-in rules (Section 5.10)
- [ ] Is proof mandatory for closure?
- [ ] Guest/read-only access supported?
- [ ] Animal type taxonomy (dogs only at launch?)
- [ ] _[TODO: add yours]_

## 12. Milestones / Phasing [TODO]

| Phase | Scope | Target |
|-------|-------|--------|
| MVP | _[TODO: must-have features]_ | _[TODO]_ |
| v1.1 | _[TODO]_ | _[TODO]_ |
| Later | _[TODO]_ | _[TODO]_ |

## 13. Appendix

- Mermaid diagrams (sitemap, lifecycle, flows A–E): _[link/path]_
- Glossary: _[TODO]_
- References: _[TODO]_