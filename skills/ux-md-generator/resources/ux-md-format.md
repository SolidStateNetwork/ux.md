# UX.md v1 Section-by-Section Format Reference

Use this structure when generating or updating a project's `UX.md`. Include every section in order and never leave `[TBD]` or `TODO` placeholders.

---

## Frontmatter template

```yaml
---
spec_version: "1.0"
project: "<Project Name>"
platform_profile: "web-app"
archetype: "<archetype-slug>"
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

## Section structure requirements

### `## 0. Product & Domain Topology`
- **Core value loop:** 1 to 2 sentences tracing the primary user action from entry to completion.
- **Auth and role boundary:** Explicit declaration (`Public`, `Single-User Authenticated`, or `Multi-Tenant RBAC with roles: [...]`) matching `.ai/01-architecture.md`.
- **Platform profile:** Input modality (`Pointer + Keyboard First`, `Touch First`, or `Terminal Keyboard Only`).

### `## 1. Spatial Architecture & App Shell`
- **ASCII app-shell diagram:** Box diagram showing persistent regions (`Topbar`, `Sidebar`, `Main Canvas`, `Inspector/Drawer` slot) with exact pixel or percentage dimensions.
- **Viewport budget proof table:**
  | Breakpoint | Fixed Chrome (`px`) | Outer Padding (`px`) | Available Content Width (`px`) | Collapse Action |
  | :--- | :--- | :--- | :--- | :--- |

### `## 2. Scroll, Viewport & Z-Index Contract`
- **Scroll ownership:** State which single DOM region scrolls vertically and forbid nested full-height vertical scrollbars.
- **Sticky regions:** State which headers, filter bars, or action footers remain pinned during scroll, and specify reserved scroll padding for fixed bars so content is never covered.
- **CLS protection:** Require fixed geometry reservations for async blocks, images, and charts.
- **Z-Index table:** Markdown table matching `z_index_scale` from frontmatter.

### `## 3. Core Page Archetypes (Blueprints)`
Define 3 to 5 named archetypes. Use the heading format `### Archetype: <ArchetypeID>` (for example `### Archetype: ListIndex`, `### Archetype: WorkspaceDetail`, `### Archetype: FocusedForm`) so the linter can cross-reference routes in Section 4.
For each archetype include:
- **Purpose and max-width**
- **ASCII wireframe**
- **Primary CTA position and action target**

### `## 4. Navigation, Route Graph & URL Persistence`
1. **Mermaid route topology:** A `flowchart LR` diagram showing how routes and overlays connect.
2. **Route reachability table (required columns):**
   | Route | Archetype | Entry Trigger | Primary Action | Exit / Cancel Fallback |
   | :--- | :--- | :--- | :--- | :--- |
   *(The `Archetype` column must match an `<ArchetypeID>` defined in Section 3.)*
3. **State persistence matrix (`F5` and Browser `Back` contract):**
   | State Category | Storage Location (`URL Query` / `LocalStorage` / `Ephemeral Memory`) | Parameter / Key Example | Reset Trigger |
   | :--- | :--- | :--- | :--- |

### `## 5. Overlay & Feedback Decision Matrix`
Table mapping interaction patterns (`Modal`, `Slide-Over Drawer`, `Popover / Menu`, `Inline Edit`, `Dedicated Route`, `Toast`, `System Banner`) with:
- **Trigger condition and max field count**
- **Dimensions (`px`)**
- **Dismiss behavior (`Esc`, backdrop click, dirty-form lock)**

### `## 6. Mandatory View States (4-State Matrix)`
Table covering every view or archetype across all 4 required states:
| View / Component | `Loading` (Skeleton Geometry) | `Empty` (Copy + Primary CTA) | `Error` (Message + Retry Action) | `Populated` (Density & Overflow) |
| :--- | :--- | :--- | :--- | :--- |

### `## 7. Mutation, Form & Permission Ergonomics`
- **Form validation timing:** When errors appear and when they clear.
- **Submit and optimistic UI policy:** Button locking, inline spinner width preservation, and optimistic list updates.
- **Dirty-state guard (`isDirty`):** Protection against accidental backdrop click or `Esc` dismissal when form inputs have unsaved edits.
- **Destructive action tiers:** Tier 1 (reversible: instant execution plus Undo Toast `4000ms`) vs. Tier 2 (irreversible: Confirmation Modal with explicit impact statement).
- **Permission and entitlement gates:** `Role-Restricted` (hide), `Prerequisite-Restricted` (disable plus tooltip), `Plan-Restricted` (visible lock badge plus upgrade popover).

### `## 8. Real-Data Stress, Density & Truncation`
- **Collection scaling:** Choose one consistent mechanism per collection type (`Cursor Pagination`, `Page-Number Pagination`, `Virtualized Infinite Scroll`).
- **Text overflow rules:** Single-line (`min-w-0 truncate` plus tooltip/tap reveal after `N` chars) vs. multi-line (`line-clamp-2`).
- **Missing or null data fallback:** Consistent placeholder string (`-` or em-dash token, never literal `null`, `undefined`, or `N/A`).
- **Numeric and temporal alignment:** `tabular-nums`, right-aligned numeric columns, and ISO/relative date threshold.

### `## 9. Responsive Reflow & Input Choreography`
- **Breakpoint collapse sequence:** Structural transformation across `1280px`, `1024px`, `768px`, and `375px` (including tablet and small-laptop states, not just desktop and phone).
- **Table and data grid reflow:** How wide tables transform below `768px` (for example stacked summary card with top 3 fields and detail drawer trigger) with zero horizontal scroll leak.
- **Touch targets and hover parity:** Minimum `44x44px` tap area with `>= 8px` spacing between adjacent targets; every hover-only reveal or tooltip requires a tap/keyboard equivalent.
- **Keyboard and focus choreography:** Shortcuts (`Cmd/Ctrl+K`, `Esc`, `Enter`), initial auto-focus inside overlays, and focus restoration on close.

### `## 10. Mandatory Layout Primitives (Code Contract)`
Table and code usage contract for the required wrapper components (`<AppShell>`, `<PageHeader>`, `<PageSection>`, `<DataStateBoundary>`) registered in `.ai/05-patterns.md` and used by all pages.

### `## 11. Project Do's, Don'ts & Agent Prompt Guide`
- **Do's and Don'ts:** Minimum 5 concrete `DO` and 5 concrete `DON'T` rules where each rule includes a specific metric, component name, or state condition.
- **Pre-commit agent checklist:** 5-point self-audit before completing any frontend task.
