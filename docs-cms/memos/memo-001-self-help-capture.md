---
title: Self-help capture — rationale
author: Engineering Team
created: 2026-06-06T00:00:00Z
tags: [data-model, memo, product]
id: memo-001
project_id: kaneer
doc_uuid: e46b8bb5-c09f-4fa3-b78a-2f6859f1fa2e
---
<!-- markdown-link-check-disable -->
# Overview

When a user taps “Help a dog” (surfaced in [Flow A](../flows/flow-a-report-a-dog.md)),
they choose between reporting the dog to the locality group or helping it themselves
with app-provided resources.
The self-help path currently leaves no record.
This memo argues that we should capture it, and sets the principles for how — the
detailed design belongs in a follow-up RFC, not here.

# Context

The reported-case path is fully moderated and lives on the feed.
The self-help path is the opposite: the user acts in the real world without waiting for
anyone, so it is neither gated nor shown on the feed.

There is real value in a record of these informal interventions.
It shows where people already act (good places to recruit rescuers), enriches a
QR-tagged dog’s history, and surfaces the contributors who do the work rather than only
report it.

# Recommendation

- **Capture self-help activity**, because the aggregate signal is valuable and we lose
  it entirely today.
- **Serve first, capture second.** The resources screen must appear with no form in the
  way; any logging is optional and happens after the user has acted.
- **Model it as its own lightweight entity, separate from `Report`** (not a flag on
  `Report`). The two have different lifecycles, gating, and visibility, and forcing them
  together would tangle both.
- **Keep it ungated and off the main feed**, visible to the author and to moderators or
  admins for outreach.

The field list, lifecycle, visibility rules, retention, and the link to the QR-tag
identity should be defined in a follow-up RFC once QR-tag scope settles, then folded
into PRD §5 and §7. This memo deliberately stops at the principles.

# References

- [Flow A — Help a dog](../flows/flow-a-report-a-dog.md)
- [prd-001 §5.2, §5.3, §7](../prds/prd-001-animal-rescue-platform.md)
- [rfc-001 — Phone OTP Login](../rfcs/rfc-001-phone-otp-login.md)
