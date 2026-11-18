---
name: ux-md-generator
description: >
  Generate, extract, audit, and validate publication-quality UX.md v1 structural UI/UX specifications.
  Defines the application skeleton (App Shell, Spatial Budget Math, Scroll/Z-Index Ownership, Page
  Archetypes, Route Reachability Graph, URL State Persistence, Overlay Decision Matrix, 4-State View
  Contract, Form/Mutation Ergonomics, and Mandatory Layout Primitives) as the structural companion
  to DESIGN.md and AGENTS.md. Use when initializing a frontend/UI project, extracting UX patterns from
  a reference product, auditing an existing codebase for layout drift, or adding new routes/views.
---

# UX.md Generator & Structural Auditor (v1)

## Overview

While `DESIGN.md` specifies the **visual skin** (colors, typography, radii, shadows, spacing tokens), `UX.md` specifies the **structural skeleton and behavioral nervous system** of an application.

Without `UX.md`, AI coding agents drift across prompts — mixing container max-widths, moving primary CTAs, alternating randomly between modals and drawers, forgetting empty/error states, losing filter state on `F5` refresh, and introducing dead-end routes.

This skill operates in **4 modes** across a strict **3-Phase Pipeline** with an automated machine linter (`scripts/validate-ux.mjs`).

---

## Operating Modes

1. **Mode A — `Synthesize` (Greenfield / `init`):**
   Derives a tailored `UX.md` from the project brief, `.ai/01-architecture.md`, and `DESIGN.md` (if present).
2. **Mode B — `Extract from Reference` (Reference Product / URL):**
   Extracts the spatial shell, interaction grammar, keyboard model, and page archetypes from a named reference product (e.g., *"UX skeleton like Linear"*, *"like ChatGPT Canvas"*, *"like Stripe Dashboard"*, *"like Shopify"*).
3. **Mode C — `Audit & Reverse-Engineer` (Existing Codebase):**
   Scans existing routes (`src/app/**`, `src/pages/**`, `src/routes/**`) and layout components, detects structural drift (inconsistent container widths, missing empty/error states, mixed modal/drawer usage), and generates a unified `UX.md`.
4. **Mode D — `Evolve` (Feature Addition / Route Sync):**
   Updates Section 3 (Page Archetypes) and Section 4 (Navigation & Route Graph) whenever new pages or workflows are added during development.

---

## 3-Phase Generation Pipeline

### Phase 1 — Context, Boundary & Archetype Analysis

Before writing any content, read:
1. `.ai/01-architecture.md` (if present) to determine authentication boundaries (`Public` vs. `Authenticated` vs. `Multi-Tenant RBAC`), realtime/streaming capabilities, and target platform.
2. `DESIGN.md` (if present) to import exact **breakpoints**, **spacing grid**, and **container max-widths** verbatim (`token_source: "DESIGN.md"`). Never invent conflicting breakpoints when `DESIGN.md` exists.
3. Load [resources/archetype-taxonomy.md](resources/archetype-taxonomy.md) and classify:
   - `platform_profile`: `web-app` | `mobile-native` | `desktop-app` | `terminal-tui`
   - `archetype`: `b2b-saas-workspace` | `ai-chat-canvas` | `analytics-dashboard` | `ecommerce-storefront` | `content-docs` | `developer-tool`

### Phase 2 — Deterministic 12-Section Synthesis

Load [resources/ux-md-format.md](resources/ux-md-format.md), [resources/layout-primitives.md](resources/layout-primitives.md), and [resources/writing-style-guide.md](resources/writing-style-guide.md). Write `UX.md` in the repository root with:

- **YAML Frontmatter:** Complete machine-verifiable configuration (`spec_version: "1.0"`, `shell_budget`, `z_index_scale`, `thresholds`, `layout_primitives`).
- **Sections `0` through `11` in exact canonical order:**
  - `## 0. Product & Domain Topology`
  - `## 1. Spatial Architecture & App Shell` (ASCII wireframe + Viewport Budget table)
  - `## 2. Scroll, Viewport & Z-Index Contract`
  - `## 3. Core Page Archetypes (Blueprints)` (using `### Archetype: <ArchetypeID>` headings)
  - `## 4. Navigation, Route Graph & URL Persistence` (Mermaid `flowchart LR` + Route Reachability Table + State Persistence Matrix)
  - `## 5. Overlay & Feedback Decision Matrix` (hard field-count and `px` thresholds)
  - `## 6. Mandatory View States (4-State Matrix)` (`Loading`, `Empty`, `Error`, `Populated`)
  - `## 7. Mutation, Form & Permission Ergonomics` (`isDirty` guard, 2-tier destructive rules, 3-way permission gates)
  - `## 8. Real-Data Stress, Density & Truncation` (single list-scaling mode, `truncate`, `—` null fallback, `tabular-nums`)
  - `## 9. Responsive Reflow & Input Choreography`
  - `## 10. Mandatory Layout Primitives (Code Contract)` (`<AppShell>`, `<PageHeader>`, `<PageSection>`, `<DataStateBoundary>`)
  - `## 11. Project Do's, Don'ts & Agent Prompt Guide`

**Cardinal Writing Rules:**
- **Zero Vague Adjectives:** Never write *"small form"*, *"clean layout"*, *"slow request"*, or *"intuitive navigation"* without explicit numbers (`<= 4 fields`, `1280px`, `>= 150ms`). See [resources/anti-patterns.md](resources/anti-patterns.md).
- **Zero Dead-Ends:** Every route in Section 4 must reference a valid `<ArchetypeID>` from Section 3 and define both an `Entry Trigger` and an `Exit / Cancel Fallback`.
- **Sync Layout Primitives:** If `.ai/05-patterns.md` exists in the repository, ensure the 4 Mandatory Layout Primitives (`<AppShell>`, `<PageHeader>`, `<PageSection>`, `<DataStateBoundary>`) are referenced there so coding sessions enforce them in code.

### Phase 3 — Cross-Audit & Machine Validation (Mandatory Before Completion)

1. Review the generated `UX.md` against [resources/quality-checklist.md](resources/quality-checklist.md) (`[UX-01]` through `[UX-16]`).
2. Run the automated linter script:
   ```bash
   node .agents/skills/ux-md-generator/scripts/validate-ux.mjs UX.md
   ```
   *(If running inside the `ux.md` repository itself, run `node skills/ux-md-generator/scripts/validate-ux.mjs <path-to-UX.md>`.)*
3. Fix any reported `error` or `warning` findings (`viewport-overflow`, `z-index-collision`, `broken-route-ref`, `orphaned-archetype`, `dead-end-flow`, `incomplete-state-matrix`, `vague-prose`, `design-md-mismatch`) and re-run until the validator exits with `0 errors`.
