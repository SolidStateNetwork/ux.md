---
name: ux-md-generator
description: >
  Generate, extract, audit, preview, diff, and validate UX.md v1 structural UI/UX specifications.
  Defines the application skeleton (app shell, spatial budget math, scroll and z-index ownership,
  page archetypes, route reachability graph, URL state persistence, overlay decision matrix,
  4-state view contract, form and mutation ergonomics, and mandatory layout primitives) as the
  structural companion to DESIGN.md and AGENTS.md. Use when initializing a frontend/UI project,
  extracting UX patterns from a reference product, auditing an existing codebase for layout drift,
  or adding new routes and views.
---

# UX.md Generator and Structural Auditor (v1)

## Overview

While `DESIGN.md` specifies visual tokens (colors, typography, radii, shadows, spacing scale), `UX.md` specifies the structural skeleton and interaction rules of an application.

Without `UX.md`, AI coding agents drift across sessions: mixing container widths, moving primary CTAs, alternating arbitrarily between modals and drawers, omitting empty or error states, losing filter state on `F5` refresh, and introducing dead-end routes.

This skill operates across four modes using a three-phase pipeline backed by five zero-dependency Node.js scripts in `scripts/`.

---

## Bundled CLI Scripts

| Script | Purpose | Example Usage |
| :--- | :--- | :--- |
| `scripts/extract-ux.mjs` | Scans `package.json`, `.ai/01-architecture.md`, `DESIGN.md`, and source routes (`src/app`, `src/pages`) into structured JSON | `node .agents/skills/ux-md-generator/scripts/extract-ux.mjs . --output ux-scan.json` |
| `scripts/generate-ux.mjs` | Scaffolds a 12-section `UX.md` from an archetype preset or `ux-scan.json` | `node .agents/skills/ux-md-generator/scripts/generate-ux.mjs --archetype b2b-saas-workspace --project "Acme" --output UX.md` |
| `scripts/validate-ux.mjs` | Runs 11 deterministic linter rules plus optional `--check-code` route parity verification | `node .agents/skills/ux-md-generator/scripts/validate-ux.mjs UX.md --strict --check-code` |
| `scripts/preview-ux.mjs` | Generates a standalone, responsive `ux-preview.html` interactive blueprint simulator | `node .agents/skills/ux-md-generator/scripts/preview-ux.mjs UX.md --output ux-preview.html` |
| `scripts/diff-ux.mjs` | Compares two `UX.md` files for route, archetype, budget, or threshold regressions | `node .agents/skills/ux-md-generator/scripts/diff-ux.mjs UX.old.md UX.md --json` |

---

## Operating modes

1. **Synthesize (greenfield / `init`):**
   Runs `extract-ux.mjs` + `generate-ux.mjs` to scaffold the initial `UX.md` from `.ai/01-architecture.md` and `DESIGN.md`, then customizes the routes, archetypes, and domain rules.
2. **Extract from reference (reference product or URL):**
   Extracts the spatial shell, interaction rules, keyboard shortcuts, and page archetypes from a named reference product (for example Linear, ChatGPT Canvas, Stripe Dashboard, Shopify, or Supabase).
3. **Audit and reverse-engineer (existing codebase):**
   Runs `extract-ux.mjs` to discover existing routes (`src/app/**`, `src/pages/**`, `src/routes/**`), detects structural drift, and generates a unified `UX.md`.
4. **Evolve (feature addition / route sync):**
   Updates Section 3 (Page Archetypes) and Section 4 (Navigation, Route Graph & URL Persistence) whenever new pages or workflows are added, verifying parity with `validate-ux.mjs UX.md --check-code`.

---

## Three-phase generation pipeline

### Phase 1: Deterministic extraction and archetype classification

1. Run `node .agents/skills/ux-md-generator/scripts/extract-ux.mjs .` (or inspect `.ai/01-architecture.md` and `DESIGN.md` directly) to detect the target runtime, authentication boundary, existing routes, and `DESIGN.md` breakpoints.
2. Load [resources/archetype-taxonomy.md](resources/archetype-taxonomy.md) and confirm:
   - `platform_profile`: `web-app` | `mobile-native` | `desktop-app` | `terminal-tui`
   - `archetype`: `b2b-saas-workspace` | `ai-chat-canvas` | `analytics-dashboard` | `ecommerce-storefront` | `developer-tool`
3. Optionally seed `UX.md` via:
   ```bash
   node .agents/skills/ux-md-generator/scripts/generate-ux.mjs --archetype <archetype> --project "<Project Name>" --output UX.md
   ```

### Phase 2: Domain-specific 12-section synthesis

Load [resources/ux-md-format.md](resources/ux-md-format.md), [resources/layout-primitives.md](resources/layout-primitives.md), and [resources/writing-style-guide.md](resources/writing-style-guide.md). Tailor `UX.md` at the repository root with:

- **YAML frontmatter:** Complete configuration (`spec_version: "1.0"`, `shell_budget`, `z_index_scale`, `thresholds`, `layout_primitives`).
- **Sections `0` through `11` in sequential order:**
  - `## 0. Product & Domain Topology`
  - `## 1. Spatial Architecture & App Shell` (ASCII wireframe and viewport budget table)
  - `## 2. Scroll, Viewport & Z-Index Contract`
  - `## 3. Core Page Archetypes (Blueprints)` (using `### Archetype: <ArchetypeID>` headings)
  - `## 4. Navigation, Route Graph & URL Persistence` (Mermaid `flowchart LR`, route reachability table, and state persistence matrix)
  - `## 5. Overlay & Feedback Decision Matrix` (field-count and `px` thresholds)
  - `## 6. Mandatory View States (4-State Matrix)` (`Loading`, `Empty`, `Error`, `Populated`)
  - `## 7. Mutation, Form & Permission Ergonomics` (`isDirty` guard, 2-tier destructive rules, 3-way permission gates)
  - `## 8. Real-Data Stress, Density & Truncation` (single list-scaling mode, `min-w-0 truncate`, `-` empty-cell placeholder token, `tabular-nums`)
  - `## 9. Responsive Reflow & Input Choreography` (collapse order, `>= 44x44px` touch targets with `>= 8px` gap, tap equivalents for hover interactions, safe-area scroll padding)
  - `## 10. Mandatory Layout Primitives (Code Contract)` (`<AppShell>`, `<PageHeader>`, `<PageSection>`, `<DataStateBoundary>`)
  - `## 11. Project Do's, Don'ts & Agent Prompt Guide`

**Writing constraints:**
- **Zero vague adjectives:** Do not write *"small form"*, *"clean layout"*, *"slow request"*, or *"intuitive navigation"* without explicit numbers (`<= 4 fields`, `1280px`, `>= 150ms`). See [resources/anti-patterns.md](resources/anti-patterns.md).
- **Zero dead ends:** Every route in Section 4 references a valid `<ArchetypeID>` from Section 3 and defines both an `Entry Trigger` and an `Exit / Cancel Fallback`.
- **Sync layout primitives:** When `.ai/05-patterns.md` exists in the repository, register the 4 mandatory layout primitives (`<AppShell>`, `<PageHeader>`, `<PageSection>`, `<DataStateBoundary>`) there so implementation tasks enforce them in code.

### Phase 3: Cross-audit and machine validation

1. Audit the generated `UX.md` against [resources/quality-checklist.md](resources/quality-checklist.md) (`[UX-01]` through `[UX-16]`).
2. Run the automated linter script:
   ```bash
   node .agents/skills/ux-md-generator/scripts/validate-ux.mjs UX.md --strict --check-code
   ```
3. Resolve any reported `error` or `warning` findings and re-run until the validator exits with `0 errors`.
