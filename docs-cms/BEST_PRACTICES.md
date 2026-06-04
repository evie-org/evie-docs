# Best Practices

This is the style and quality reference for documents in the Kaneer CMS. Pair it with
`AGENT_GUIDE.md`, which covers workflow and process.

## Principles

- **The CMS is ground truth.** Treat existing documents as authoritative.
  Cite specifics with `file:line` references rather than paraphrasing from memory.
- **Propose, don’t decide.** Agents create documents as `status: Proposed`. Humans
  review and approve status changes.
- **Validate everything before committing.** Run `docuchango validate` and fix every
  reported issue.
- **Keep docs current with code.** When code changes invalidate a decision, update or
  supersede the relevant document.

## Document lifecycle

1. **Search first.** Look for an existing document that already covers the topic.
   Update it instead of duplicating.
2. **Choose the type.** ADR for decisions, RFC for proposals, Memo for information, PRD
   for product requirements.
3. **Copy the template.** Start from the matching file in `templates/`.
4. **Fill all frontmatter.** Generate a fresh `doc_uuid` and `created` timestamp.
   Use the correct zero-padded id and filename.
5. **Write quality content.** Be specific and concrete.
   Prefer short sentences and short paragraphs.
6. **Link related docs.** Cross-reference ADRs, RFCs, and PRDs that relate to the topic.
7. **Validate.** Run `docuchango validate`.
8. **Commit.** Include the validation result in your change description.

## Readability targets

These match the thresholds in `docs-project.yaml`. Write so the document passes them:

| Metric | Target |
| --- | --- |
| Flesch Reading Ease | ≥ 60.0 |
| Flesch–Kincaid Grade | ≤ 10.0 |
| Gunning Fog | ≤ 12.0 |
| SMOG Index | ≤ 12.0 |
| Automated Readability Index | ≤ 10.0 |
| Coleman–Liau Index | ≤ 10.0 |
| Dale–Chall | ≤ 9.0 |
| Minimum paragraph length | 100 characters |

Tips to hit these targets:

- Use plain words over jargon where a plain word works.
- Keep sentences under about 20 words.
- Break long paragraphs into shorter ones, but keep each paragraph at least 100
  characters so it reads as a complete thought.

## Admonitions

Use GitHub-style admonitions, which the site renders correctly:

```markdown
> [!NOTE]
> Useful context.

> [!WARNING]
> Something to watch out for.
```
