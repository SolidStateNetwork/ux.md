# UX.md Quality & Cross-Audit Checklist

Run this checklist in Phase 3 before finalizing any generated or updated `UX.md`. Every item must pass.

---

## 1. Frontmatter & Mathematical Integrity

- [ ] **[UX-01]** YAML frontmatter is present and valid
  - Check: Contains `spec_version`, `project`, `platform_profile`, `archetype`, `token_source`, `scroll_owner`, `breakpoints`, `shell_budget`, `z_index_scale`, `thresholds`, `layout_primitives`.
  - Fail reason: Missing keys or malformed YAML syntax.
  - Fix: Populate all required frontmatter keys before writing prose sections.

- [ ] **[UX-02]** Viewport budget math adds up at `1280px`
  - Check: `left_nav_px + right_panel_px + outer_padding_px + content_min_px <= desktop_viewport` (or `collapse_priority` explicitly folds `right_panel` at `>= desktop_viewport`).
  - Fail reason: Fixed panels plus minimum content width overflow a `1280px` screen.
  - Fix: Reduce panel widths or add a deterministic `collapse_priority` rule.

- [ ] **[UX-03]** Z-Index scale is strictly monotonic
  - Check: `base < sticky < navigation < drawer < modal < popover < toast < tooltip`.
  - Fail reason: `popover` or `tooltip` has a lower/equal value than `modal` or `drawer`.
  - Fix: Restore canonical ascending scale (`0, 10, 20, 30, 40, 50, 60, 70`).

- [ ] **[UX-04]** Breakpoints align with `DESIGN.md` (when `DESIGN.md` exists)
  - Check: Compare `breakpoints` in `UX.md` against Section 10 (`Responsive`) in `DESIGN.md`.
  - Fail reason: `UX.md` uses `768px` while `DESIGN.md` specifies `640px` or `800px`.
  - Fix: Copy breakpoint values verbatim from `DESIGN.md` when present.

---

## 2. Structural & Route Referential Integrity

- [ ] **[UX-05]** All 12 canonical sections (`## 0.` to `## 11.`) exist in order
  - Check: Verify section headings `0` through `11` appear sequentially.
  - Fail reason: Skipped or reordered section.
  - Fix: Restore canonical section order defined in `ux-md-format.md`.

- [ ] **[UX-06]** Every route in Section 4 maps to a defined Archetype from Section 3
  - Check: Cross-reference the `Archetype` column in Section 4 against `### Archetype: <ID>` headings in Section 3.
  - Fail reason: Route references an archetype name that does not exist in Section 3.
  - Fix: Add the missing archetype to Section 3 or normalize the archetype ID in Section 4.

- [ ] **[UX-07]** Zero orphaned archetypes
  - Check: Every `### Archetype: <ID>` in Section 3 is used by at least one route in Section 4.
  - Fail reason: An archetype was defined in Section 3 but never mapped to any route.
  - Fix: Map the archetype to its routes or remove the unused archetype.

- [ ] **[UX-08]** Zero dead-end routes or overlays
  - Check: Every row in Section 4's Route Reachability Table has non-empty `Entry Trigger`, `Primary Action`, and `Exit / Cancel Fallback` cells (no `TBD`, `TODO`, or `-`).
  - Fail reason: A route can be entered without a defined return/cancel path or has no entry trigger in navigation.
  - Fix: Specify the exact navigation trigger and exit fallback route/action.

- [ ] **[UX-09]** State Persistence Matrix covers URL, LocalStorage, and Ephemeral state
  - Check: Section 4 explicitly maps filters/tabs/pagination/drawer-inspection to `URL Query` so `F5` and Browser `Back` preserve context.
  - Fail reason: View-defining state is left unspecified or defaulted to local component memory.
  - Fix: Add the State Persistence Matrix table in Section 4.

---

## 3. Behavioral & State Completeness

- [ ] **[UX-10]** Overlay Matrix has hard field-count and pixel thresholds
  - Check: Section 5 distinguishes `Modal` (`<= 4` fields), `Drawer` (`5–12` fields / inspect), and `Dedicated Route` (`> 12` fields / wizard) with explicit pixel widths.
  - Fail reason: Vague wording ("small forms vs large forms").
  - Fix: Insert exact field counts and pixel dimensions.

- [ ] **[UX-11]** 4-State Matrix is complete for every view
  - Check: Every row in Section 6 defines `Loading`, `Empty`, `Error`, and `Populated` cells (plus `Streaming/Partial` for AI/realtime apps).
  - Fail reason: Empty cell, `"N/A"`, or `"Spinner"` without geometry reservation.
  - Fix: Define geometry-matched skeleton, empty CTA, and in-place error retry for every row.

- [ ] **[UX-12]** Dirty-Form Guard (`isDirty`) and 2-tier destructive rules are specified
  - Check: Section 7 specifies backdrop/`Esc` interception for dirty forms and separates reversible actions (Undo Toast) from irreversible actions (Confirm Modal).
  - Fail reason: Missing form protection or single-tier deletion policy.
  - Fix: Document both tiers and the `isDirty` guard in Section 7.

- [ ] **[UX-13]** Permission gates distinguish Role, Prerequisite, and Plan restrictions
  - Check: Section 7 specifies `Hide` (unauthorized role), `Disable + Tooltip` (unmet prerequisite), and `Lock Badge` (plan/tier gate).
  - Fail reason: Inconsistent handling of disabled vs hidden actions.
  - Fix: Add the 3-way permission gate rule in Section 7.

- [ ] **[UX-14]** Real-data stress rules cover truncation, null fallback (`—`), and `tabular-nums`
  - Check: Section 8 defines single collection scaling mode, `truncate`/`line-clamp`, `—` for missing values, and right-aligned `tabular-nums`.
  - Fail reason: Missing overflow or null-value formatting rules.
  - Fix: Complete all four items in Section 8.

- [ ] **[UX-15]** Mandatory Layout Primitives match frontmatter and `.ai/05-patterns.md`
  - Check: Section 10 documents `<AppShell>`, `<PageHeader>`, `<PageSection>`, and `<DataStateBoundary>`.
  - Fail reason: Section 10 omits code contracts or mismatches `layout_primitives` frontmatter.
  - Fix: Align Section 10 with `layout_primitives.md`.

- [ ] **[UX-16]** Machine linter (`node validate-ux.mjs UX.md`) passes with 0 errors
  - Check: Execute `node skills/ux-md-generator/scripts/validate-ux.mjs UX.md` (or `.agents/skills/ux-md-generator/scripts/validate-ux.mjs UX.md`).
  - Fail reason: Linter reports any `error` finding.
  - Fix: Resolve all reported findings and re-run until `errors: 0`.
