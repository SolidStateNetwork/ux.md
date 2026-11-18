# UX.md Writing Style Guide

`UX.md` is an operational engineering specification read by AI coding agents on frontend tasks. Write with high information density, concrete numbers, and zero marketing filler.

---

## 1. Banned vague phrases (zero-ambiguity rule)

Never use standalone subjective adjectives without a concrete metric. The linter (`vague-prose`) flags these patterns:

| Banned vague phrase | Required deterministic replacement |
| :--- | :--- |
| *"clean / modern / intuitive layout"* | `"1280px max-width canvas with 240px fixed left rail and 24px section gaps"` |
| *"use modals for small/simple forms"* | `"use Centered Modal (max-w: 480px) strictly for forms with <= 4 fields and 0 internal scroll"` |
| *"show a loader on slow requests"* | `"suppress loaders < 150ms; render geometry-matched shimmer skeleton >= 150ms"` |
| *"responsive on mobile devices"* | `"below 1024px: collapse right inspector to overlay drawer; below 768px: collapse left nav to bottom sheet and convert tables to 3-field stacked cards"` |
| *"user-friendly empty state"* | `"centered empty container (max-w: 420px) with 1-sentence explanation and primary creation CTA button"` |
| *"handle long text gracefully"* | `"apply min-w-0 and truncate (1 line) with hover/tap tooltip after 36 chars on table cells; line-clamp-2 on card descriptions"` |

---

## 2. Required units and notation

1. **Dimensions:** Specify exact pixels (`240px`, `1280px`) or explicit CSS/Tailwind tokens (`max-w-7xl (1280px)`).
2. **Durations:** Use milliseconds (`150ms`, `4000ms`), never `"4 seconds"` or `"briefly"`.
3. **Field and item counts:** Use explicit comparison operators (`<= 4 fields`, `5 to 12 fields`, `25 rows/page`).
4. **Prose punctuation:** Avoid em dashes in prose sentences and avoid all-caps shouting (`MUST`, `NEVER`); write constraints clearly in sentence case.
5. **ASCII diagrams:** Use standard ASCII box characters (`+---+`, `|`, `---`) inside fenced `text` code blocks so every tokenizer parses spatial boundaries accurately.
6. **Mermaid diagrams:** Use `flowchart LR` with quoted node labels (`id["/projects/:id (WorkspaceDetail)"]`) to prevent parser errors on slashes or parentheses.
