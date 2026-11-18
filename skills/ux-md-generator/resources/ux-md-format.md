# UX.md v1 Section-by-Section Format Reference

Use this exact structure when generating or updating a project's `UX.md`. Never omit a section and never leave `[TBD]` or `TODO` placeholders.

---

## Frontmatter Template

```yaml
---
spec_version: "1.0"
project: "<Project Name>"
platform_profile: "web-app"          # web-app | mobile-native | desktop-app | terminal-tui
archetype: "<archetype-slug>"        # b2b-saas-workspace | ai-chat-canvas | analytics-dashboard | ecommerce-storefront | content-docs | developer-tool
token_source: "DESIGN.md"            # DESIGN.md (if present) | standalone
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

---

## Section Structure Requirements

### `## 0. Product & Domain Topology`
- **Core Value Loop:** 1–2 sentences tracing the primary user action from entry to completion.
- **Auth & Role Boundary:** Explicit declaration (`Public`, `Single-User Authenticated`, or `Multi-Tenant RBAC with roles: [...]`). Must match `.ai/01-architecture.md`.
- **Platform Profile:** Input modality (`Pointer + Keyboard First`, `Touch First`, or `Terminal Keyboard Only`).

### `## 1. Spatial Architecture & App Shell`
- **ASCII App-Shell Diagram:** Visual box diagram showing persistent regions (`Topbar`, `Sidebar`, `Main Canvas`, `Inspector/Drawer` slot) with exact pixel/percentage dimensions.
- **Viewport Budget Proof Table:**
  | Breakpoint | Fixed Chrome (`px`) | Outer Padding (`px`) | Available Content Width (`px`) | Collapse Action |
  | :--- | :--- | :--- | :--- | :--- |

### `## 2. Scroll, Viewport & Z-Index Contract`
- **Scroll Ownership:** Explicitly state which single DOM region scrolls vertically and forbid nested full-height vertical scrollbars.
- **Sticky Regions:** Which headers, filter bars, or action footers remain pinned during scroll.
- **CLS Protection:** Mandatory geometry reservation for async blocks, images, and charts.
- **Z-Index Table:** Markdown table matching `z_index_scale` from frontmatter.

### `## 3. Core Page Archetypes (Blueprints)`
Define 3 to 5 named archetypes. Every archetype MUST use the heading format `### Archetype: <ArchetypeID>` (e.g., `### Archetype: ListIndex`, `### Archetype: WorkspaceDetail`, `### Archetype: FocusedForm`) so the linter can cross-reference routes in Section 4.
For each archetype include:
- **Purpose & Max-Width**
- **ASCII Wireframe**
- **Primary CTA Position & Action Target**

### `## 4. Navigation, Route Graph & URL Persistence`
1. **Mermaid Route Topology:** A `flowchart LR` diagram showing how routes and overlays connect.
2. **Route Reachability Table (Mandatory Columns):**
   | Route | Archetype | Entry Trigger | Primary Action | Exit / Cancel Fallback |
   | :--- | :--- | :--- | :--- | :--- |
   *(Note: The `Archetype` column must exactly match an `<ArchetypeID>` defined in Section 3.)*
3. **State Persistence Matrix (The F5 / Back-Button Contract):**
   | State Category | Storage Location (`URL Query` / `LocalStorage` / `Ephemeral Memory`) | Parameter / Key Example | Reset Trigger |
   | :--- | :--- | :--- | :--- |

### `## 5. Overlay & Feedback Decision Matrix`
Table mapping interaction patterns (`Modal`, `Slide-Over Drawer`, `Popover / Menu`, `Inline Edit`, `Dedicated Route`, `Toast`, `System Banner`) with:
- **Trigger Condition & Max Field Count**
- **Dimensions (`px`)**
- **Dismiss Behavior (`Esc`, Backdrop click, Dirty-Form lock)**

### `## 6. Mandatory View States (4-State Matrix)`
Table covering every view/archetype across all 4 required states:
| View / Component | `Loading` (Skeleton Geometry) | `Empty` (Copy + Primary CTA) | `Error` (Message + Retry Action) | `Populated` (Density & Overflow) |
| :--- | :--- | :--- | :--- | :--- |

### `## 7. Mutation, Form & Permission Ergonomics`
- **Form Validation Timing:** When errors appear and when they clear.
- **Submit & Optimistic UI Policy:** Button locking, inline spinner width preservation, and optimistic list updates.
- **Dirty-State Guard (`isDirty`):** Protection against accidental backdrop click or `Esc` dismissal when form inputs have unsaved edits.
- **Destructive Action Tiers:** Tier 1 (Reversible -> Instant + Undo Toast `4000ms`) vs. Tier 2 (Irreversible -> Confirmation Modal with explicit impact statement).
- **Permission & Entitlement Gates:** `Role-Restricted` (Hide), `Prerequisite-Restricted` (Disable + Tooltip), `Plan-Restricted` (Visible Lock Badge + Upgrade Popover).

### `## 8. Real-Data Stress, Density & Truncation`
- **Collection Scaling:** Choose ONE consistent mechanism per collection type (`Cursor Pagination`, `Page-Number Pagination`, `Virtualized Infinite Scroll`).
- **Text Overflow Rules:** Single-line (`truncate` + tooltip after `N` chars) vs. multi-line (`line-clamp-2`).
- **Missing / Null Data Fallback:** Consistent placeholder token (`—`, never literal `null`, `undefined`, or `N/A`).
- **Numeric & Temporal Alignment:** `tabular-nums`, right-aligned numeric columns, ISO/relative date threshold.

### `## 9. Responsive Reflow & Input Choreography`
- **Breakpoint Collapse Sequence:** Exact structural transformation at `1280px`, `1024px`, `768px`, and `375px`.
- **Table & Data Grid Reflow:** How wide tables transform below `768px` (e.g., stacked summary card with top 3 fields + detail drawer trigger).
- **Keyboard & Focus Choreography:** First-class shortcuts (`Cmd/Ctrl+K`, `Esc`, `Enter`), initial auto-focus inside overlays, and focus return on close.

### `## 10. Mandatory Layout Primitives (Code Contract)`
Table and code usage contract for the required wrapper components (`<AppShell>`, `<PageHeader>`, `<PageSection>`, `<DataStateBoundary>`) that must be registered in `.ai/05-patterns.md` and used by all pages.

### `## 11. Project Do's, Don'ts & Agent Prompt Guide`
- **Do's & Don'ts:** Minimum 5 concrete `DO` and 5 concrete `DON'T` rules passing the Counter-Intuitive Test (each rule must include a specific metric, component name, or state condition).
- **Pre-Commit Agent Checklist:** 5-point self-audit before completing any frontend task.
