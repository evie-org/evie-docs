# Docs CMS

This is the governed knowledge base for Kaneer.
It holds structured documents validated by the `docuchango` CLI, and it serves as the
single source of truth for decisions, proposals, and requirements.

## Folder map

| Folder | Contents |
| --- | --- |
| `adrs/` | Architecture Decision Records — significant technical decisions. |
| `rfcs/` | Requests for Comments — proposals and designs under discussion. |
| `memos/` | Technical memos — information sharing and findings. |
| `prds/` | Product Requirements Documents — product scope and requirements. |
| `templates/` | Starting templates for each document type. |
| `static/` | Static assets referenced by documents. |

## Choosing a document type

The four governed types differ by *when* in a decision’s lifecycle they are written and
*what* they are for — defining, proposing, deciding, or informing.

| Type | Folder | Stage | Question it answers | State when written |
| --- | --- | --- | --- | --- |
| PRD | `prds/` | Before building | *What* should we build, and *why*? | Requirements (the ask) |
| RFC | `rfcs/` | While deciding | *How* should we build it? | Open for discussion |
| ADR | `adrs/` | After deciding | *What* did we decide, and why? | Settled (immutable record) |
| Memo | `memos/` | Anytime | Here is something you should know | Informational |

A typical decision flows **PRD → RFC → ADR**, with **memos** sitting alongside:

- A **PRD** kicks things off — a product owner defines the problem, scope, requirements,
  and success criteria.
  It is deliberately light on implementation: the “what” and “why”, not the “how”.
- An **RFC** proposes *how* to build it, lays out options and trade-offs, and invites
  feedback. Its defining trait is that it is *in flight* — it can change, be rejected, or
  spawn alternatives. One RFC may lead to several ADRs, or none.
- An **ADR** records the *outcome* of a significant technical decision (often the
  conclusion of an RFC): the context, the decision, and its consequences.
  ADRs are short, numbered, and immutable — you do not edit an old one, you supersede it
  with a new one. They are the long-term memory of “why is it like this?”.
- A **memo** *informs* but does not propose or decide — a finding, a benchmark, an
  investigation writeup.
  If it asks “what should we do?”
  it is an RFC; if it says “we decided X” it belongs in an ADR.

Quick test for which folder:

- Defining a product need?
  → **PRD**
- Proposing a design and want feedback?
  → **RFC**
- Recording a decision that has been made?
  → **ADR**
- Sharing knowledge or findings?
  → **Memo**

## Key files

- `AGENT_GUIDE.md` — workflow reference for agents (read first).
- `BEST_PRACTICES.md` — style and quality reference.
- `CONTRIBUTING.md` — how to add a document.
- `docs-project.yaml` — project, document-type, and readability configuration.

## Validate

```bash
# From this directory
docuchango validate

# Or from the repository root
make validate-docs-cms
```

## Naming

Governed documents are named `<type>-NNN-<slug>.md`, where `NNN` is a zero-padded
3-digit number — for example, `adr-001-database-choice.md`. Every document needs YAML
frontmatter, and the body begins with `<!-- markdown-link-check-disable -->`.
