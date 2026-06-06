---
title: User Flows
sidebar_position: 1
---
# User Flows

Diagrams of how users move through Kaneer.
Each flow is a single Mermaid diagram plus a short structured description (actor, goal,
preconditions, branches).
PRDs link here from their **User Flows** section.

| Flow | Description | Linked from |
| --- | --- | --- |
| [Flow A — Report a dog](flow-a-report-a-dog.md) | A signed-in member browses the feed and submits a new case (QR-preferred, manual fallback). | [prd-001 §8](../prds/prd-001-animal-rescue-platform.md) |
| Flow B — Rescuer responds | *TODO* | prd-001 §8 |
| Flow C — Moderator triage (Gate 1) | *TODO* | prd-001 §8 |
| Flow D — Closure verification (Gate 2) | *TODO* | prd-001 §8 |
| Flow E — Admin group setup | *TODO* | prd-001 §8 |

## Conventions

- **PRD altitude → flowchart.** What the *user* experiences and decides; no API detail.
  Use `flowchart TD` with diamonds for decisions.
- **RFC altitude → sequence diagram.** How systems interact; show the API calls and
  provider handshakes.
  Use `sequenceDiagram`.
- **Shapes (flowchart):** `( )` start/end, `[ ]` screen or action, `[/ /]` user
  input/output, `{ }` decision.
- **Colors (flowchart):** green for entry/exit, orange for decisions.

## Authoring notes

- Mermaid renders automatically — your `docusaurus.config.ts` already has
  `markdown.mermaid: true` and the `@docusaurus/theme-mermaid` theme.
- Avoid `;` inside Mermaid notes/labels — it is a statement separator and breaks the
  parser. Use `—`, `,` or `.` instead.
- This folder is **not** governed by `docuchango` (only `adrs/`, `rfcs/`, `memos/`,
  `prds/` are). No frontmatter rules, no readability checks; keep flows lightweight.
