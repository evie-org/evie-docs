---
title: Flows
sidebar_position: 5
---
# User Flows

Diagrams of how users move through Kaneer.
Each flow is one Mermaid diagram plus a short structured description (actor, goal,
preconditions, branches).
PRDs link here from their **User Flows** section.

| Flow | Description | Linked from |
| --- | --- | --- |
| [Flow A — Help a dog](flow-a-report-a-dog.md) | Member reports a dog to the group, or helps it themselves. | [prd-001 §8](../prds/prd-001-animal-rescue-platform.md) |
| Flow B — Rescuer responds | *TODO* | prd-001 §8 |
| Flow C — Moderator triage (Gate 1) | *TODO* | prd-001 §8 |
| Flow D — Closure verification (Gate 2) | *TODO* | prd-001 §8 |
| Flow E — Admin group setup | *TODO* | prd-001 §8 |

## Conventions

- **PRD altitude → flowchart.** What the *user* experiences and decides; no API detail.
- **RFC altitude → sequence diagram.** How systems interact (API calls, handshakes).
- **Shapes:** `( )` start/end, `[ ]` screen or action, `[/ /]` input/output, `{ }`
  decision.
- **Colors:** green = entry/exit, orange = decision.

## Authoring notes

- Avoid `;` inside Mermaid labels/notes — it is a statement separator and breaks the
  parser. Use `—`, `,` or `.`.
- This folder is not governed by `docuchango`, so there are no frontmatter or
  readability rules — keep flows lightweight.
