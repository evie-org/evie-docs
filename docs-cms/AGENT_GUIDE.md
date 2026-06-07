# Agent Guide

This guide is the primary workflow reference for AI agents working in the Kaneer
documentation CMS. Read it before acting.

## Core principle

The `docs-cms/` directory is the single source of truth for architecture decisions,
proposals, and product requirements.
Read the relevant documents before answering a question or proposing a change.
Do not invent context that the CMS already records.

## Quick reference

Run these from the `docs-cms/` directory:

| Command | Purpose |
| --- | --- |
| `docuchango validate` | Validate all governed documents. |
| `docuchango validate --dry-run` | Preview issues without modifying files. |
| `docuchango validate --verbose` | Validate with detailed output. |

From the repository root, `make validate` runs document validation along with formatting
and link checks.

## Agent workflow

1. **Gather context.** Search the CMS for documents related to the task.
   Read the full document, not just the title.
2. **Answer with citations.** Cite specific documents and lines.
   For example: “According to ADR-015, the service uses event sourcing — see
   `docs-cms/adrs/adr-015-event-sourcing.md:42`.”
3. **Propose new docs from templates.** When a decision or proposal is missing, copy the
   matching template from `templates/` and fill in every frontmatter field.
4. **Validate before committing.** Run `docuchango validate` and fix all reported
   issues.

## Document type guide

| Type | Use for | Folder | Required frontmatter |
| --- | --- | --- | --- |
| **ADR** | Architecture decisions | `adrs/` | `id`, `project_id`, `doc_uuid`, `title`, `tags`, `status`, `created`, `deciders` |
| **RFC** | Proposals and designs | `rfcs/` | `title`, `status`, `author`, `created`, `tags`, `id`, `project_id`, `doc_uuid` |
| **Memo** | Information sharing | `memos/` | `title`, `author`, `created`, `tags`, `id`, `project_id`, `doc_uuid` |
| **PRD** | Product requirements | `prds/` | `title`, `status`, `created`, `deciders`, `tags`, `id`, `project_id`, `doc_uuid` |

Files must be named `<type>-NNN-<slug>.md` with a zero-padded 3-digit number (for
example, `adr-001-database-choice.md`). The document body starts with
`<!-- markdown-link-check-disable -->`.

### Frontmatter generation helpers

```bash
# Generate a UUID
python -c "import uuid; print(uuid.uuid4())"

# Generate a UTC timestamp
python -c "from datetime import datetime, timezone; print(datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'))"
```

## Status lifecycle

```
Proposed → Accepted → Implemented
```

A document may also be **Rejected** (declined before acceptance) or **Superseded**
(replaced by a newer document).

## Superseding flow

When a new document replaces an older one:

1. The new document sets `supersedes: <old-id>` in its frontmatter.
2. The old document sets `status: Superseded` and `superseded_by: <new-id>`.

This keeps the decision history traceable in both directions.
