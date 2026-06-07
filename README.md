---
sidebar_position: 1
---
# Kaneer

A documentation-as-code framework with two cooperating systems:

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
| `.githooks/` | Versioned git hooks (pre-commit gate). |
| `Makefile` | Format, validation, and hook-install targets. |

## Prerequisites

- **Node.js 18+** and npm (CI uses Node 22) — for the Docusaurus site and the link
  checker.
- **Python 3.10+** and pip — for the `docuchango` validator and `flowmark` formatter.
- **GNU Make** — to run the targets below.

## First-time setup

Run these once after cloning:

```bash
# 1. Python tools (docuchango + flowmark) in a local virtualenv
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\Activate.ps1
pip install docuchango flowmark

# 2. Markdown link checker (global npm package)
npm install -g markdown-link-check

# 3. Docusaurus site dependencies
cd docsite && npm install && cd ..

# 4. Enable the git pre-commit hook (format + validation gate)
make hooks
```

## Daily commands

```bash
# Format all Markdown, then validate
make fmt
make validate

# Preview the site locally (http://localhost:3000)
cd docsite && npm start
```

## Pre-commit checks

`make hooks` points git at `.githooks/`, installing a pre-commit gate that runs
`make validate` (formatting, document validation, and links) and **blocks the commit**
if anything fails. Run `make fmt` to fix formatting.

Notes:

- The hook is **local and opt-in**: each clone must run `make hooks` once, and the gate
  can be bypassed with `git commit --no-verify`. It is fast feedback, not a hard
  guarantee.
- For enforcement that cannot be bypassed, the same `make validate` runs in CI on pull
  requests; mark it a required status check under branch protection on `main`.

## Make targets

Run `make help` to list all available targets.
