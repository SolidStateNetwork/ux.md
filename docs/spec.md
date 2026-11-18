# UX.md Format Specification (v1.0)

`UX.md` is a hybrid specification format that combines **machine-verifiable YAML frontmatter** with **12 canonical Markdown sections** (ASCII spatial diagrams, deterministic decision tables, and Mermaid route topology graphs).

---

## 1. File Location & Naming

- Must be placed at the repository root as `UX.md` (sibling to `AGENTS.md` and `DESIGN.md`).
- In monorepos with multiple distinct frontend apps (e.g., `apps/web/UX.md` and `apps/mobile/UX.md`), package-scoped `UX.md` files may be placed at each application root.

---

## 2. YAML Frontmatter Schema

Every `UX.md` file MUST begin with a YAML frontmatter block containing machine-readable structural invariants validated by `validate-ux.mjs`:

```yaml
---
spec_version: "1.0"
project: "Acme Workspace"
platform_profile: "web-app"          # web-app | mobile-native | desktop-app | terminal-tui
archetype: "b2b-saas-workspace"      # b2b-saas-workspace | ai-chat-canvas | analytics-dashboard | ecommerce-storefront | content-docs | developer-tool
token_source: "DESIGN.md"            # DESIGN.md | standalone
scroll_owner: "inner-canvas"         # window | inner-canvas | split-pane
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
    - panel: "right_panel"
      below_px: 1280
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
  no_spinner_Below_ms: 150
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

---

## 3. The 12 Canonical Sections

Sections MUST appear in the following exact order (`0` through `11`):

| Section Heading | Required Content |
| :--- | :--- |
| `## 0. Product & Domain Topology` | Target user workflow loop, authentication boundary (`Public`, `Authenticated`, `Multi-Tenant RBAC`), and platform profile constraints aligned with `.ai/01-architecture.md`. |
| `## 1. Spatial Architecture & App Shell` | ASCII wireframe of the persistent application frame, zone dimensions (`px`/`rem`), and verified Viewport Budget calculation (`Fixed Panels + Padding + Content Min <= 1280px`). |
| `## 2. Scroll, Viewport & Z-Index Contract` | Primary scroll container ownership, sticky header/footer rules, zero-layout-shift (`CLS = 0`) reservations, and the monotonic Z-Index layer table. |
| `## 3. Core Page Archetypes (Blueprints)` | 3–5 named screen templates (e.g., `ListIndex`, `WorkspaceDetail`, `FocusedForm`). Each archetype includes an ASCII layout box, zone slots, and fixed Primary CTA coordinates. |
| `## 4. Navigation, Route Graph & URL Persistence` | Mermaid `flowchart LR` of all routes + a Route Reachability Table (`Route`, `Archetype`, `Entry Trigger`, `Primary Action`, `Exit/Cancel Fallback`) + the State Persistence Matrix (`URL Query`, `LocalStorage`, `Ephemeral Memory`). |
| `## 5. Overlay & Feedback Decision Matrix` | Deterministic rules separating `Modal`, `Drawer/Sheet`, `Popover`, `Inline Expansion`, `Dedicated Route`, `Toast`, and `Top Banner` with hard field-count and pixel thresholds. |
| `## 6. Mandatory View States (4-State Matrix)` | Matrix mapping every view/component to `Loading (Skeleton)`, `Empty (Explanation + CTA)`, `Error (Reason + In-Place Retry)`, and `Populated` (plus `Streaming/Partial` where applicable). |
| `## 7. Mutation, Form & Permission Ergonomics` | Validation timing, double-submit locking, dirty-form backdrop/Esc protection (`isDirty` guard), 2-tier destructive action rules (`Undo Toast` vs. `Confirm Modal`), and permission gates (`Hide` vs. `Disable + Tooltip` vs. `Lock Badge`). |
| `## 8. Real-Data Stress, Density & Truncation` | List scaling strategy (`Pagination` vs. `Infinite Scroll` vs. `Virtualization`), single/multi-line truncation rules, null fallback string (`—`), and right-aligned `tabular-nums` rules. |
| `## 9. Responsive Reflow & Input Choreography` | Breakpoint collapse sequence (`1280px` -> `1024px` -> `768px` -> `375px`), table-to-card conversion, keyboard shortcut map (`Cmd+K`, `Esc`, `Enter`), and focus restoration rules. |
| `## 10. Mandatory Layout Primitives (Code Contract)` | Specification of the shared layout wrapper components (`<AppShell>`, `<PageHeader>`, `<PageSection>`, `<DataStateBoundary>`) that all route files must compose. |
| `## 11. Project Do's, Don'ts & Agent Prompt Guide` | Counter-intuitive negative constraints with measurable numbers + a pre-commit verification checklist for AI coding agents. |

---

## 4. Linter Rules (`validate-ux.mjs`)

The `UX.md` linter enforces 11 deterministic rules:

| Rule ID | Severity | Verification Logic |
| :--- | :--- | :--- |
| `missing-frontmatter` | `error` | Verifies YAML frontmatter exists and contains required keys (`spec_version`, `platform_profile`, `shell_budget`, `z_index_scale`, `thresholds`, `layout_primitives`). |
| `missing-sections` | `error` | Verifies all 12 canonical sections (`## 0.` through `## 11.`) exist. |
| `section-order` | `warning` | Verifies sections appear in canonical order `0` through `11`. |
| `viewport-overflow` | `error` | Checks `left_nav_px + right_panel_px + outer_padding_px + content_min_px <= desktop_viewport` (or requires a valid `collapse_priority` entry). |
| `z-index-collision` | `error` | Verifies `base < sticky < navigation < drawer < modal < popover < toast < tooltip` without duplicate or inverted values. |
| `broken-route-ref` | `error` | Verifies every route in Section 4 references a defined Page Archetype from Section 3. |
| `orphaned-archetype` | `warning` | Flags any Page Archetype defined in Section 3 that is never assigned to a route in Section 4. |
| `dead-end-flow` | `error` | Flags any route in Section 4 missing an `Entry Trigger` or `Exit/Cancel Fallback` (or containing `TBD`, `TODO`, `-`, `none`). |
| `incomplete-state-matrix` | `error` | Verifies Section 6 defines all 4 mandatory states (`Loading`, `Empty`, `Error`, `Populated`) for every listed view. |
| `vague-prose` | `warning` | Scans for banned ambiguous phrases without supporting numbers (e.g., *"small form"*, *"clean layout"*, *"intuitive navigation"*, *"fast loading"*). |
| `design-md-mismatch` | `warning` | When `DESIGN.md` is present in the project root, checks for conflicting breakpoint numbers or unresolved placeholder markers. |
