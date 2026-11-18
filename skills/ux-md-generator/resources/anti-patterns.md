# UX.md Anti-Pattern Catalog

A catalog of structural and behavioral mistakes when generating `UX.md` specifications or building UI screens from them.

---

### AP-01: Vague threshold prose
- **Tell:** Subjective adjectives instead of numeric thresholds for layout, overlays, or latency.
- **Bad example:**
  ```markdown
  Use modals for small forms and drawers for larger forms. Show a loading spinner on slow requests.
  ```
- **Why:** "Small", "larger", and "slow" have no deterministic boundary. One session uses a modal for 6 fields; the next uses a drawer for 3 fields.
- **Fix:**
  ```markdown
  Centered Modal (`max-w: 480px`): strictly `<= 4` fields, zero internal scroll.
  Slide-Over Drawer (`width: 540px`): `5 to 12` fields or detail inspection.
  Dedicated Route: `> 12` fields or multi-step wizards.
  Requests `< 150ms` render no loader; `>= 150ms` render a geometry-matched skeleton.
  ```
- **Detection:** Linter rule `vague-prose`.

---

### AP-02: Unbounded viewport math
- **Tell:** Fixed-width panels (sidebar, inspector, minimum content width, outer padding) whose sum exceeds the target desktop breakpoint (`1280px`) without a collapse rule.
- **Bad example:**
  ```yaml
  shell_budget:
    desktop_viewport: 1280
    left_nav_px: 280
    right_panel_px: 380
    outer_padding_px: 64
    content_min_px: 760
  ```
- **Why:** `280 + 380 + 64 + 760 = 1484px > 1280px`. On `1280px` laptops, content overflows horizontally or collides.
- **Fix:** Keep the total budget `<= 1280px` or declare `collapse_priority` so `right_panel` folds into an overlay drawer below `1484px`.
- **Detection:** Linter rule `viewport-overflow`.

---

### AP-03: Ghost controls and dead-end routes
- **Tell:** Buttons (`Export`, `Filter`, `Settings`) rendered with no handler (`onClick={() => {}}`, `href="#"`), or routes lacking an entry trigger or exit fallback.
- **Why:** Creates unreachable orphan pages or trapped views.
- **Fix:** Every route in Section 4 declares both `Entry Trigger` and `Exit / Cancel Fallback`. Unimplemented controls do not render in production (or render `disabled` with a milestone tooltip).
- **Detection:** Linter rules `broken-route-ref` and `dead-end-flow`.

---

### AP-04: Double vertical scrollbars
- **Tell:** Mixing `window` document scroll on one route with nested `h-screen overflow-y-auto` containers on another route inside the same app shell.
- **Why:** Produces two parallel vertical scrollbars on the right edge of the browser and breaks sticky headers.
- **Fix:** Declare a single `scroll_owner` (`inner-canvas`, `window`, or `split-pane`) in YAML frontmatter and Section 2, enforced by `<AppShell>`.

---

### AP-05: Ephemeral URL state (`F5` wipeout)
- **Tell:** Storing active tabs, search queries, table filters, pagination pages, or open detail drawer IDs solely in local component memory (`useState`).
- **Why:** Pressing `F5` (Refresh), sharing a link, or clicking Browser `Back` resets the view and loses user context.
- **Fix:** Synchronize view-defining parameters (`?tab=`, `?q=`, `?page=`, `?inspect=`) to the URL in Section 4's state persistence matrix.

---

### AP-06: Silent dirty-form dismissal
- **Tell:** Allowing an outside backdrop click or `Esc` keypress to immediately close a modal or drawer containing unsaved user input (`isDirty === true`).
- **Why:** A stray click discards user data entry without warning.
- **Fix:** In Section 7, enforce a dirty-form guard: when `isDirty === true`, intercept backdrop and `Esc` events and prompt `"Discard unsaved changes?"` (or persist an automatic draft).

---

### AP-07: Z-index layer inversion
- **Tell:** Assigning `Popover / Select / Combobox` or `Tooltip` a z-index equal to or lower than `Modal` or `Drawer`.
- **Why:** Opening a datepicker, select menu, or tooltip inside a modal renders the dropdown behind the modal backdrop.
- **Fix:** Enforce strictly ascending z-index layers: `base (0) < sticky (10) < navigation (20) < drawer (30) < modal (40) < popover (50) < toast (60) < tooltip (70)`.
- **Detection:** Linter rule `z-index-collision`.

---

### AP-08: Toast spam and ephemeral error toasts
- **Tell:** Firing a toast notification for self-evident inline actions (such as toggling a switch) or displaying actionable error messages inside an auto-dismissing toast.
- **Why:** Auto-dismissing error toasts vanish before the user can read or fix the problem.
- **Fix:** Omit toasts for direct visual toggles; use auto-dismiss toasts (`4000ms`) only for background confirmations or Undo actions; keep errors persistent inline or in a sticky banner.

---

### AP-09: Spinner flicker and layout shift (`CLS`)
- **Tell:** Rendering a small centered spinner inside a collapsing `0px`-height container before replacing it with a `600px` data table.
- **Why:** Causes vertical layout jumps when data arrives.
- **Fix:** Use `<DataStateBoundary>` with geometry-matched skeletons that reserve the height and grid of the populated view.

---

### AP-10: Literal `null` and unbounded string overflow
- **Tell:** Rendering raw `null`, `undefined`, or `N/A` in empty table cells, or omitting truncation (`min-w-0 truncate` / `line-clamp-2`) on dynamic user strings.
- **Why:** Long compound words, URLs, or UUIDs overflow table columns and flex cards.
- **Fix:** Enforce `min-w-0 truncate` (or `line-clamp-2`) on dynamic text nodes and render a consistent empty-cell placeholder token (`-`).
