---
sidebar_position: 1
---
# Kaneer

Documentation for Kaneer.

This repository is a documentation-as-code framework with two cooperating systems:

1. **`docs-cms/`** — a governed knowledge base of structured documents (ADRs, RFCs,
   memos, PRDs) validated by the `docuchango` CLI. This is the single source of truth.
2. **`docsite/`** — a [Docusaurus 3](https://docusaurus.io/) site that renders
   `README.md`, `docs/**`, and `docs-cms/**` into a browsable site with an
   auto-generated sidebar.

Markdown is formatted with `flowmark` and link-checked with `markdown-link-check`. The
top-level `Makefile` wires the tooling together.

## Repository layout

| Path | Purpose |
| --- | --- |
| `docs/` | Free-form documentation tree. |
| `docs-cms/` | Governed CMS — architecture decisions, RFCs, memos, PRDs. |
| `docsite/` | Docusaurus site that renders the docs. |
| `Makefile` | Format and validation targets. |

## Quick start

```bash
# Format and validate all docs
make fmt-docs
make validate-docs

# Build the documentation site
cd docsite && npm install && npm run build
```

## Tooling prerequisites

These external tools must be available:

- [`docuchango`](https://pypi.org/project/docuchango/) — CMS validator (Python;
  installable via `uvx docuchango` or `pip install docuchango`).
- `flowmark` — Markdown formatter (`pip install flowmark`).
- `markdown-link-check` — Markdown link checker (`npm i -g markdown-link-check`).
- Node.js 18+ and npm for the Docusaurus site.

## Make targets

Run `make help` to list all available targets.
