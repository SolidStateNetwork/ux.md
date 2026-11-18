# UX.md

<p align="center">
  <img src="assets/hero.svg" alt="UX.md: Structural UI/UX specification standard for AI coding agents" width="100%" />
</p>

<p align="center">
  <a href="https://github.com/SolidStateNetwork/ux.md/actions/workflows/validate.yml"><img src="https://github.com/SolidStateNetwork/ux.md/actions/workflows/validate.yml/badge.svg" alt="UX.md Spec & Linter CI" /></a>
  <a href="docs/spec.md"><img src="https://img.shields.io/badge/Specification-v1.0-0284c7" alt="Spec v1.0" /></a>
  <a href="skills/ux-md-generator/SKILL.md"><img src="https://img.shields.io/badge/Agent_Skill-ux--md--generator-0f172a" alt="Agent Skill" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-334155" alt="MIT License" /></a>
</p>

`UX.md` is a format specification, zero-dependency CLI toolkit (extractor, generator, linter, HTML previewer, and diff engine), and installable AI agent skill for structural UI/UX architecture.

While `AGENTS.md` defines engineering rules and `DESIGN.md` defines visual tokens (the skin), `UX.md` defines the application skeleton and interaction rules: app shells, viewport budget math, scroll and z-index ownership, page archetypes, route reachability graphs, URL state persistence, 4-state view contracts, and mandatory layout primitives.

---

## Why `UX.md` exists (skin vs. skeleton)

Giving an AI coding agent a `DESIGN.md` ensures every screen uses the right colors, fonts, and border radii. Across multi-session prompts, however, the interface still fractures structurally:

- **Session 1** builds `/issues` with a `1280px` container, places `+ New Issue` in the top-right header, edits items in a right-hand slide-over drawer, and renders a geometry-matched skeleton loader.
- **Session 2** builds `/cycles` with an `896px` container, places the creation button underneath the table, opens a centered modal for an 8-field form, and renders plain `"Loading..."` text.
- **Session 3** omits empty and error states, stores active filters in local `useState` (so pressing `F5` or Browser `Back` resets the screen), and renders an `Export` button wired to `onClick={() => {}}`.

| File standard | Role | What it governs |
| :--- | :--- | :--- |
| **`AGENTS.md`** | **Brain & governance** | Module boundaries, build/test commands, dependency rules, security constraints |
| **`DESIGN.md`** | **Skin & visual tokens** | Color palette, typography scale, border radii, shadows, spacing units, motion curves |
| **`UX.md`** | **Skeleton & behavior** | App shell geometry, page archetypes, route graph, modal vs. drawer thresholds, 4-state view matrix (`Loading / Empty / Error / Populated`), URL state persistence, and code layout primitives |

---

## Quickstart

### 1. Install the agent skill (`ux-md-generator`)

Works with Claude Code, Antigravity / Gemini CLI, Cursor, OpenCode, OpenAI Codex, and GitHub Copilot:

```bash
npx skills add SolidStateNetwork/ux.md --skill ux-md-generator --copy -y
```

### 2. CLI toolkit (`extract`, `generate`, `validate`, `preview`, `diff`)

All five bundled scripts run on Node.js 20+ with zero external npm dependencies:

```bash
# 1. Scan an existing repository (framework, DESIGN.md tokens, and source routes)
node .agents/skills/ux-md-generator/scripts/extract-ux.mjs . --output ux-scan.json

# 2. Generate a 12-section UX.md from an archetype preset or scan file
node .agents/skills/ux-md-generator/scripts/generate-ux.mjs --archetype b2b-saas-workspace --project "Acme Workspace" --output UX.md

# 3. Validate UX.md against 11 linter rules + live source code route parity
node .agents/skills/ux-md-generator/scripts/validate-ux.mjs UX.md --strict --check-code

# 4. Render an interactive HTML wireframe & breakpoint simulator (1280px / 768px / 375px)
node .agents/skills/ux-md-generator/scripts/preview-ux.mjs UX.md --output ux-preview.html

# 5. Diff two UX.md versions for route, budget, or threshold regressions
node .agents/skills/ux-md-generator/scripts/diff-ux.mjs UX.old.md UX.md --json
```

### 3. Prompt your AI coding agent

- **Synthesize (greenfield / `init`):**
  > "Use `ux-md-generator` to generate a `UX.md` for our Next.js B2B billing workspace aligned with `.ai/01-architecture.md` and `DESIGN.md`."
- **Extract from a reference product:**
  > "Use `ux-md-generator` to create a `UX.md` modeled after Linear's keyboard-first workspace and slide-over inspector drawer."
- **Audit and reverse-engineer existing code:**
  > "Run `ux-md-generator` in audit mode across `src/app/` to unify our container widths, modal/drawer thresholds, and missing empty/error states into `UX.md`."
- **Evolve when adding routes:**
  > "Add the `/settings/webhooks` route to `UX.md` and validate it before implementing the page."

---

## The `UX.md` v1 format (YAML frontmatter + 12 sections)

Modeled on the hybrid structure of [Google's `DESIGN.md` specification](https://github.com/google-labs-code/design.md), `UX.md` pairs machine-verifiable YAML frontmatter with 12 ordered Markdown sections (see [`docs/spec.md`](docs/spec.md) and [`PHILOSOPHY.md`](PHILOSOPHY.md)):

```yaml
---
spec_version: "1.0"
project: "Acme Workspace"
platform_profile: "web-app"
archetype: "b2b-saas-workspace"
token_source: "DESIGN.md"
scroll_owner: "inner-canvas"
breakpoints:
  mobile_max: 767
  tablet_max: 1023
  desktop_min: 1280
shell_budget:
  desktop_viewport: 1280
  left_nav_px: 240
  right_panel_px: 0
  outer_padding_px: 48
  content_min_px: 720
  collapse_priority:
    - panel: "left_nav"
      below_px: 1024
z_index_scale:
  base: 0
  sticky: 10
  navigation: 20
  drawer: 30
  modal: 40
  popover: 50
  toast: 60
  tooltip: 70
thresholds:
  modal_max_fields: 4
  no_spinner_below_ms: 150
  skeleton_min_ms: 150
  toast_auto_dismiss_ms: 4000
  min_touch_target_px: 44
layout_primitives:
  - "AppShell"
  - "PageHeader"
  - "PageSection"
  - "DataStateBoundary"
---
```

| Section | Enforced contract |
| :--- | :--- |
| **`0. Product & Domain Topology`** | Core user loop, auth/RBAC boundary, and input modality aligned with system architecture |
| **`1. Spatial Architecture & App Shell`** | ASCII app-shell wireframe, zone dimensions (`px`), and verified viewport budget math at `1280px`, `768px`, and `375px` |
| **`2. Scroll, Viewport & Z-Index Contract`** | Single scroll owner (prevents double scrollbars), sticky regions, `CLS = 0` reservations, and monotonic Z-Index table |
| **`3. Core Page Archetypes (Blueprints)`** | 3 to 5 named screen templates (`### Archetype: <ID>`) with ASCII wireframes and fixed primary CTA coordinates |
| **`4. Navigation, Route Graph & URL Persistence`** | Mermaid `flowchart LR` route map, bi-directional route reachability table, and URL state persistence matrix for `F5` and Browser `Back` |
| **`5. Overlay & Feedback Decision Matrix`** | Numeric thresholds separating `Modal` (`<= 4` fields), `Drawer` (`5 to 12` fields / inspect), `Dedicated Route` (`> 12` fields), `Popover`, and `Toast` |
| **`6. Mandatory View States (4-State Matrix)`** | Every view mapped across `Loading (Skeleton)`, `Empty (Copy + CTA)`, `Error (Reason + In-Place Retry)`, and `Populated` |
| **`7. Mutation, Form & Permission Ergonomics`** | Validation timing, double-submit locking, `isDirty` backdrop/`Esc` guard, 2-tier destructive rules (`Undo Toast` vs. `Confirm Modal`), and 3-way permission gates (`Hide` vs. `Disable + Tooltip` vs. `Lock Badge`) |
| **`8. Real-Data Stress, Density & Truncation`** | Single collection scaling strategy, `min-w-0 truncate` / `line-clamp`, `-` null fallback token, and right-aligned `tabular-nums` |
| **`9. Responsive Reflow & Input Choreography`** | Breakpoint collapse sequence, table-to-card conversion below `768px`, touch target size (`>= 44px` with `>= 8px` gap), tap equivalents for hover actions, and focus trapping |
| **`10. Mandatory Layout Primitives (Code Contract)`** | Shared code wrappers (`<AppShell>`, `<PageHeader>`, `<PageSection>`, `<DataStateBoundary>`) required across all route files |
| **`11. Project Do's, Don'ts & Agent Prompt Guide`** | Negative constraints with measurable numbers and a pre-commit verification checklist |

---

## Automated linter rules (`validate-ux.mjs`)

| Rule ID | Severity | What it verifies |
| :--- | :--- | :--- |
| `missing-frontmatter` | `error` | Required YAML frontmatter keys (`spec_version`, `shell_budget`, `z_index_scale`, `thresholds`, `layout_primitives`) |
| `missing-sections` | `error` | All 12 canonical sections (`## 0.` through `## 11.`) exist |
| `section-order` | `warning` | Sections appear in canonical order `0` through `11` |
| `viewport-overflow` | `error` | `left_nav_px + right_panel_px + outer_padding_px + content_min_px <= desktop_viewport` (or valid `collapse_priority`) |
| `z-index-collision` | `error` | Strictly ascending scale (`base < sticky < navigation < drawer < modal < popover < toast < tooltip`) |
| `broken-route-ref` | `error` | Every route in Section 4 references an `<ArchetypeID>` defined in Section 3 |
| `orphaned-archetype` | `warning` | Flags any page archetype defined in Section 3 that is never used by a route in Section 4 |
| `dead-end-flow` | `error` | Flags routes missing an `Entry Trigger`, `Primary Action`, or `Exit / Cancel Fallback` |
| `incomplete-state-matrix` | `error` | Verifies Section 6 defines all 4 mandatory states (`Loading`, `Empty`, `Error`, `Populated`) per view |
| `vague-prose` | `warning` | Flags non-deterministic adjectives (*"modals for small forms"*, *"clean layout"*) and unresolved `TODO`/`TBD` markers |
| `design-md-mismatch` | `warning` | Verifies `token_source: "DESIGN.md"` alignment when a sibling `DESIGN.md` is present |
| `route-parity` | `warning` | With `--check-code`, verifies that discovered routes in `src/app` or `src/pages` are registered in Section 4 |

---

## Reference examples (all 5 core archetypes)

| Example | Archetype | Highlights |
| :--- | :--- | :--- |
| [`examples/b2b-saas-workspace/UX.md`](examples/b2b-saas-workspace/UX.md) | `b2b-saas-workspace` | Keyboard-first issue workspace with `240px` rail, `?inspect=` slide-over drawer (`540px`), and `Cmd+K` command palette |
| [`examples/ai-chat-canvas/UX.md`](examples/ai-chat-canvas/UX.md) | `ai-chat-canvas` | Split-pane conversational thread with synchronized artifact code/preview stage (`?artifact=`) and streaming scroll-lock rules |
| [`examples/analytics-dashboard/UX.md`](examples/analytics-dashboard/UX.md) | `analytics-dashboard` | Global URL-persisted time/environment filter bar (`?from=&to=&env=`), `CLS = 0` chart reservations, and `600px` JSON event drawer |
| [`examples/ecommerce-storefront/UX.md`](examples/ecommerce-storefront/UX.md) | `ecommerce-storefront` | Faceted discovery catalog, `4:5` aspect-reserved media, slide-over Cart Drawer (`?cart=open`), and guest-first checkout funnel |
| [`examples/developer-tool/UX.md`](examples/developer-tool/UX.md) | `developer-tool` | Split SQL workbench, streaming build-log drawer (`?log=`), inline `2000ms` copy checkmarks, and Tier-2 slug-confirm modals |

---

## Repository structure

```text
ux.md/
├── .github/workflows/validate.yml
├── README.md
├── PHILOSOPHY.md
├── docs/
│   └── spec.md
├── examples/
│   ├── b2b-saas-workspace/UX.md
│   ├── ai-chat-canvas/UX.md
│   ├── analytics-dashboard/UX.md
│   ├── ecommerce-storefront/UX.md
│   └── developer-tool/UX.md
└── skills/
    └── ux-md-generator/
        ├── SKILL.md
        ├── resources/
        │   ├── ux-md-format.md
        │   ├── archetype-taxonomy.md
        │   ├── layout-primitives.md
        │   ├── anti-patterns.md
        │   ├── quality-checklist.md
        │   └── writing-style-guide.md
        └── scripts/
            ├── extract-ux.mjs
            ├── generate-ux.mjs
            ├── validate-ux.mjs
            ├── preview-ux.mjs
            └── diff-ux.mjs
```

---

## License

MIT © [SolidStateNetwork](https://github.com/SolidStateNetwork)
