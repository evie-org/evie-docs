# Docs CMS

The governed knowledge base for Kaneer: structured documents validated by the
`docuchango` CLI, and the single source of truth for decisions, proposals, and
requirements.

## Folder map

| Folder | Contents |
| --- | --- |
| `adrs/` | Architecture Decision Records — significant technical decisions. |
| `rfcs/` | Requests for Comments — proposals and designs under discussion. |
| `memos/` | Technical memos — information sharing and findings. |
| `prds/` | Product Requirements Documents — product scope and requirements. |
| `flows/` | User-flow diagrams (Mermaid). Linked from PRDs and RFCs; not governed by `docuchango`. |
| `templates/` | Starting templates for each document type. |
| `static/` | Static assets referenced by documents. |

## Choosing a document type

The four governed types differ by *when* in a decision’s lifecycle they are written and
*what* they are for.

| Type | Folder | Stage | Question it answers | State when written |
| --- | --- | --- | --- | --- |
| PRD | `prds/` | Before building | *What* should we build, and *why*? | Requirement (the ask) |
| RFC | `rfcs/` | While deciding | *How* should we build it? | Open for discussion |
| ADR | `adrs/` | After deciding | *What* did we decide, and why? | Settled (immutable) |
| Memo | `memos/` | Anytime | Here is something you should know | Informational |

Typical lifecycle: **PRD → RFC → ADR**, with **memos** alongside.
An RFC may be rejected or spawn several ADRs; ADRs are immutable — supersede them rather
than edit.

## Key files

- `AGENT_GUIDE.md` — workflow reference for agents (read first).
- `BEST_PRACTICES.md` — style and quality reference.
- `CONTRIBUTING.md` — how to add a document.
- `docs-project.yaml` — project, document-type, and readability configuration.

## Validate

```bash
# Validate just these documents (from this directory)
docuchango validate

# Or run all checks from the repository root
make validate
```

## Naming

Governed documents are named `<type>-NNN-<slug>.md`, where `NNN` is a zero-padded
3-digit number — for example, `adr-001-database-choice.md`. Every document needs YAML
frontmatter, and the body begins with `<!-- markdown-link-check-disable -->`.
