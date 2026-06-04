# Contributing to the Docs CMS

Follow these steps to add a document to the Kaneer CMS.

## 1. Pick a document type

| Type | Use for | Folder |
| --- | --- | --- |
| ADR | Architecture decisions | `adrs/` |
| RFC | Proposals and designs | `rfcs/` |
| Memo | Information sharing | `memos/` |
| PRD | Product requirements | `prds/` |

## 2. Copy the template

Copy the matching file from `templates/` into the correct folder, and rename it to
`<type>-NNN-<slug>.md`. Use the next available zero-padded 3-digit number — for example,
`adr-002-caching-strategy.md`.

## 3. Fill in the frontmatter

Every document needs complete YAML frontmatter.
Generate fresh values:

```bash
# Generate a UUID for doc_uuid
python -c "import uuid; print(uuid.uuid4())"

# Generate a UTC timestamp for created
python -c "from datetime import datetime, timezone; print(datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'))"
```

Keep the body’s first line as `<!-- markdown-link-check-disable -->`.

## 4. Write the content

Write clear, concrete content that meets the readability targets in `BEST_PRACTICES.md`.
Link related documents where helpful.

## 5. Format and validate

```bash
# From the repository root
make fmt-docs
make validate-docs
```

Fix any reported issues before committing.

## 6. Commit

New documents should keep `status: Proposed` until a human reviewer approves them.
