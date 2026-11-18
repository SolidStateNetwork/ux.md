---
name: ux-md-generator
description: >
  Generate, extract, audit, and validate UX.md v1 structural UI/UX specifications.
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

This skill runs across four operating modes using a three-phase pipeline and an automated linter (`scripts/validate-ux.mjs`).

---

## Operating modes

1. **Synthesize (greenfield / `init`):**
   Derives a tailored `UX.md` from the project brief, `.ai/01-architecture.md`, and `DESIGN.md` (when present).
2. **Extract from reference (reference product or URL):**
   Extracts the spatial shell, interaction rules, keyboard shortcuts, and page archetypes from a named reference product (for example Linear, ChatGPT Canvas, Stripe Dashboard, or Shopify).
3. **Audit and reverse-engineer (existing codebase):**
   Scans existing routes (`src/app/**`, `src/pages/**`, `src/routes/**`) and layout components, detects structural drift (inconsistent container widths, missing empty/error states, mixed modal/drawer usage), and generates a unified `UX.md`.
4. **Evolve (feature addition / route sync):**
   Updates Section 3 (Page Archetypes) and Section 4 (Navigation, Route Graph & URL Persistence) whenever new pages or workflows are added.

---

## Three-phase generation pipeline

### Phase 1: Context, boundary, and archetype analysis

Before writing `UX.md`, inspect:
1. `.ai/01-architecture.md` (if present) to determine authentication boundaries (`Public`, `Single-User Authenticated`, or `Multi-Tenant RBAC`), realtime/streaming capabilities, and target runtime.
2. `DESIGN.md` (if present) to import exact breakpoints, spacing grid, and container widths verbatim (`token_source: "DESIGN.md"`). Do not invent conflicting breakpoints when `DESIGN.md` exists.
3. Load [resources/archetype-taxonomy.md](resources/archetype-taxonomy.md) and select:
   - `platform_profile`: `web-app` | `mobile-native` | `desktop-app` | `terminal-tui`
   - `archetype`: `b2b-saas-workspace` | `ai-chat-canvas` | `analytics-dashboard` | `ecommerce-storefront` | `content-docs` | `developer-tool`

### Phase 2: Deterministic 12-section synthesis

Load [resources/ux-md-format.md](resources/ux-md-format.md), [resources/layout-primitives.md](resources/layout-primitives.md), and [resources/writing-style-guide.md](resources/writing-style-guide.md). Write `UX.md` at the repository root with:

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
  - `## 8. Real-Data Stress, Density & Truncation` (single list-scaling mode, `truncate`, empty-cell placeholder token, `tabular-nums`)
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
   node .agents/skills/ux-md-generator/scripts/validate-ux.mjs UX.md
   ```
   *(When running inside the `ux.md` repository itself, run `node skills/ux-md-generator/scripts/validate-ux.mjs <path-to-UX.md>`.)*
3. Resolve any reported `error` or `warning` findings (`viewport-overflow`, `z-index-collision`, `broken-route-ref`, `orphaned-archetype`, `dead-end-flow`, `incomplete-state-matrix`, `vague-prose`, `design-md-mismatch`) and re-run until the validator exits with `0 errors`.
