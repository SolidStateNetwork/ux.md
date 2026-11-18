# UX.md Philosophy

`UX.md` captures how an application is **structured, navigated, and experienced across states**. While `AGENTS.md` defines code governance and `DESIGN.md` defines visual tokens (the skin), `UX.md` defines the structural skeleton and behavioral nervous system of the interface.

---

## 1. Skin vs. Skeleton: Why `DESIGN.md` Alone Is Not Enough

When an AI coding agent is given only a `DESIGN.md` (or a component library like shadcn/ui), every page uses the right hex colors, font weights, and border radii — yet the application still fractures across prompts:

- **Screen A** uses a `1280px` container, places the primary CTA in the top-right header, edits records in a right-hand slide-over drawer, and renders a 4-row shimmer skeleton while loading.
- **Screen B** (generated three prompts later) uses an `896px` container, places the primary CTA below a table, opens a centered modal for a 9-field form, and renders plain `"Loading..."` text.
- **Screen C** forgets the empty state entirely, hides filters inside local `useState` so pressing `F5` wipes the view, and includes an `"Export"` button wired to `onClick={() => {}}`.

All three screens obey `DESIGN.md`. None of them share the same skeleton. `UX.md` solves this by locking in the **spatial architecture, page archetypes, route topology, state matrices, and code layout primitives** in a single deterministic document.

---

## 2. Thresholds Over Adjectives

Adjectives do not constrain AI models. Writing *"use a clean layout, intuitive navigation, and modals for small forms"* produces generic output because every model interprets *"small"* or *"clean"* differently on every turn.

In `UX.md`, every behavioral rule must be expressed as a **measurable threshold or deterministic condition**:

- **Bad:** *"Use modals for simple inputs and drawers for complex forms."*
- **Good:** *"Use a centered Modal (`max-w: 480px`) only for destructive confirmations or forms with `<= 4` input fields and zero internal scrolling. Forms with `>= 5` fields, multi-step sections, or file uploads must use a Slide-Over Drawer (`width: 540px`) or a dedicated route."*

---

## 3. Spatial Budget Math Is Non-Negotiable

A layout specification that does not add up mathematically forces the agent to improvise CSS overrides. Every `UX.md` must prove its **Viewport Budget** across Desktop (`1280px`), Tablet (`768px`), and Mobile (`375px`):

```text
Sum(Fixed Navigation Panels + Inspector Panels + Outer Padding + Content Min-Width) <= Viewport Width
```

Whenever fixed panels plus minimum content width exceed a breakpoint, `UX.md` must declare the exact **Collapse Priority** (which panel folds into a sheet, bottom bar, or overlay first).

---

## 4. Zero Dead-Ends & Zero Ghost Controls

Every interactive element and route in an interface is a promise to the user. `UX.md` enforces two structural invariants:

1. **Bi-Directional Route Reachability:** Every route in the Route Graph must map to a named Page Archetype, declare at least one Entry Trigger (Sidebar, Command Palette, Row Action), and declare an explicit Exit/Cancel Fallback.
2. **No Ghost Controls:** Controls without a backing route or handler (`href="#"`, `onClick={() => {}}`) are forbidden. Unbuilt roadmap features must either be omitted from the DOM or rendered as `disabled` with a tooltip stating the milestone.

---

## 5. The 4-State View Contract & F5 Survival

No data-driven screen is complete when only its happy path renders:

1. **Every data view must define four structural states:** `Loading` (geometry-matched skeleton with zero layout shift), `Empty` (explanation + primary creation/reset CTA), `Error` (failure reason + in-place retry action), and `Populated` (truncation, null fallback `—`, and pagination/virtualization rules).
2. **State Persistence (The F5 / Back-Button Rule):** Active tabs, search queries, filters, pagination, and open detail drawers must be synchronized with URL parameters so browser refresh (`F5`), deep links, and the browser `Back` button behave predictably.

---

## 6. Enforced via Code Layout Primitives

Markdown rules alone can still be bypassed if an agent writes raw `<div className="flex max-w-6xl p-6 ...">` wrappers inside individual route files. `UX.md` bridges documentation and code by declaring **Mandatory Layout Primitives** (`<AppShell>`, `<PageHeader>`, `<PageSection>`, `<DataStateBoundary>`) that every route file must compose.
