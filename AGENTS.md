# Documentation Agent Instructions

When working on documentation in `docs-cms/` (including `adrs/`, `memos/`, `prds/`,
`rfcs/`, and `templates/`), always review and follow:

1. `docs-cms/AGENT_GUIDE.md`
2. `docs-cms/BEST_PRACTICES.md`

## Required Behavior

- Treat `docs-cms/AGENT_GUIDE.md` as the primary workflow reference.
- Treat `docs-cms/BEST_PRACTICES.md` as the style/quality reference.
- On conflict, follow AGENT_GUIDE first, then BEST_PRACTICES where compatible.
- Keep generated documents concise; favor diagrams, tables, and other visuals over
  prose.

## Notes and Admonitions

Use GitHub admonition style: `> [!NOTE]`, `> [!TIP]`, `> [!IMPORTANT]`, `> [!WARNING]`,
`> [!CAUTION]`. Prefer these over bold-blockquote variants.

## Formatting

Run `make fmt` and `make validate` to format and validate all docs.
