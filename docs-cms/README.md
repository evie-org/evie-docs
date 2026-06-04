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
