# UX.md Anti-Pattern Catalog

A catalog of structural and behavioral mistakes when generating `UX.md` specifications or building UI screens from them.

---

### AP-01: Vague Threshold Prose
**Description:** Writing subjective adjectives instead of numeric thresholds for layout, overlays, or latency.
**Bad Example:**
```markdown
Use modals for small forms and drawers for larger forms. Show a loading spinner on slow requests.
```
**Why It's Wrong:** "Small", "larger", and "slow" have no deterministic meaning. Session 1 will use a modal for 6 fields; Session 2 will use a drawer for 3 fields.
**Correct Approach:**
```markdown
Centered Modal (`max-w: 480px`): strictly `<= 4` fields, zero internal scroll.
Slide-Over Drawer (`width: 540px`): `5 to 12` fields or detail inspection.
Dedicated Route: `> 12` fields or multi-step wizards.
Requests `< 150ms` render no loader; `>= 150ms` render a geometry-matched skeleton.
```
**Detection:** Linter rule `vague-prose`.

---

### AP-02: Unbounded Viewport Math
**Description:** Defining fixed-width panels (Sidebar + Inspector + Content Min-Width + Padding) whose sum exceeds the target desktop breakpoint (`1280px`) without specifying a collapse rule.
**Bad Example:**
```yaml
shell_budget:
  desktop_viewport: 1280
  left_nav_px: 280
  right_panel_px: 380
  outer_padding_px: 64
  content_min_px: 760
```
**Why It's Wrong:** `280 + 380 + 64 + 760 = 1484px > 1280px`. On standard `1280px` laptops, content overflows horizontally or collides.
**Correct Approach:** Keep total budget `<= 1280px` OR declare `collapse_priority` so `right_panel` folds into an overlay drawer below `1480px`.
**Detection:** Linter rule `viewport-overflow`.

---

### AP-03: Ghost Controls & Dead-End Routes
**Description:** Rendering buttons (`Export`, `Filter`, `Settings`) with no handler (`onClick={() => {}}`, `href="#"`) or defining routes without an Entry Trigger or Exit/Cancel Fallback.
**Why It's Wrong:** Breaks user trust and creates unreachable "orphan pages" or trapped views.
**Correct Approach:** Every route in Section 4 must declare both `Entry Trigger` and `Exit / Cancel Fallback`. Unimplemented buttons must not render in production (or must be `disabled` with a milestone tooltip).
**Detection:** Linter rules `broken-route-ref` and `dead-end-flow`.

---

### AP-04: Double Vertical Scrollbars
**Description:** Mixing `window` document scroll on one route with nested `h-screen overflow-y-auto` containers on another route inside the same App Shell.
**Why It's Wrong:** Produces two parallel vertical scrollbars on the right edge of the browser and breaks sticky headers.
**Correct Approach:** Declare a single `scroll_owner` (`inner-canvas`, `window`, or `split-pane`) in YAML frontmatter and Section 2, enforced strictly by `<AppShell>`.

---

### AP-05: Ephemeral URL State (F5 Wipeout)
**Description:** Storing active tabs, search queries, table filters, pagination pages, or open detail drawer IDs solely in local component memory (`useState`).
**Why It's Wrong:** Pressing `F5` (Refresh), sharing a link, or clicking Browser `Back` resets the entire view and loses user context.
**Correct Approach:** Synchronize view-defining parameters (`?tab=`, `?q=`, `?page=`, `?inspect=`) to the URL in Section 4's State Persistence Matrix.

---

### AP-06: Silent Dirty-Form Dismissal
**Description:** Allowing an outside backdrop click or `Esc` keypress to immediately close a Modal or Drawer containing unsaved user input (`isDirty === true`).
**Why It's Wrong:** A single stray click destroys minutes of user data entry.
**Correct Approach:** In Section 7, enforce a Dirty-Form Guard: when `isDirty === true`, intercept backdrop/`Esc` events and prompt `"Discard unsaved changes?"` (or persist an automatic draft).

---

### AP-07: Z-Index Layer Inversion
**Description:** Assigning `Popover / Select / Combobox` or `Tooltip` a z-index equal to or lower than `Modal` or `Drawer`.
**Why It's Wrong:** Opening a datepicker, select menu, or tooltip *inside* a Modal renders the dropdown invisibly behind the Modal backdrop.
**Correct Approach:** Enforce strictly ascending z-index layers: `base (0) < sticky (10) < navigation (20) < drawer (30) < modal (40) < popover (50) < toast (60) < tooltip (70)`.
**Detection:** Linter rule `z-index-collision`.

---

### AP-08: Toast Spam & Ephemeral Error Toasts
**Description:** Firing a toast notification for self-evident inline actions (e.g., toggling a switch) OR displaying actionable error messages inside an auto-dismissing toast.
**Why It's Wrong:** Auto-dismissing error toasts vanish before the user can read or fix the problem.
**Correct Approach:** Never show toasts for direct visual toggles; use auto-dismiss toasts (`4000ms`) only for background confirmations/Undo; keep all errors persistent inline or in a sticky banner.

---

### AP-09: Spinner Flicker & Layout Shift (CLS)
**Description:** Rendering a small centered spinner inside a collapsing `0px`-height container before replacing it with a `600px` data table.
**Why It's Wrong:** Causes violent vertical jumps (Cumulative Layout Shift) when data arrives.
**Correct Approach:** Use `<DataStateBoundary>` with geometry-matched skeletons that reserve the exact height/grid of the populated view.

---

### AP-10: Literal `null` / Unbounded Long-String Overflow
**Description:** Rendering raw `null`, `undefined`, or `N/A` in empty table cells, or failing to specify truncation (`truncate` / `line-clamp-2`) for user-generated strings.
**Why It's Wrong:** Long compound words (e.g., German nouns, long URLs, UUIDs) blow out table columns and flex cards.
**Correct Approach:** Enforce `min-w-0` + `truncate` (or `line-clamp-2`) on all dynamic text nodes and render `—` for empty/null values.
