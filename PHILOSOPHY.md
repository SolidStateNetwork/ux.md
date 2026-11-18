# UX.md Philosophy

`UX.md` specifies how an application is structured, navigated, and experienced across states. While `AGENTS.md` defines code governance and `DESIGN.md` defines visual tokens (the skin), `UX.md` defines the structural skeleton and interaction rules of the interface.

---

## 1. Skin vs. skeleton: why `DESIGN.md` alone is not enough

When an AI coding agent only receives a `DESIGN.md` (or a component library like shadcn/ui), every page uses the right hex colors, font weights, and border radii, yet the application still fractures across sessions:

- **Screen A** uses a `1280px` container, places the primary CTA in the top-right header, edits records in a right-hand slide-over drawer, and renders a 4-row shimmer skeleton while loading.
- **Screen B** (generated three prompts later) uses an `896px` container, places the primary CTA below a table, opens a centered modal for a 9-field form, and renders plain `"Loading..."` text.
- **Screen C** omits the empty state, hides filters inside local `useState` so pressing `F5` resets the view, and includes an `Export` button wired to `onClick={() => {}}`.

All three screens obey `DESIGN.md`, yet none of them share a common skeleton. `UX.md` solves this by locking in the spatial architecture, page archetypes, route topology, state matrices, and code layout primitives in a single verifiable document.

---

## 2. Thresholds over adjectives

Adjectives do not constrain language models. Writing *"use a clean layout, intuitive navigation, and modals for small forms"* produces inconsistent output because a model interprets *"small"* or *"clean"* differently on every turn.

In `UX.md`, every behavioral rule is expressed as a measurable threshold or deterministic condition:

- **Vague:** *"Use modals for simple inputs and drawers for complex forms."*
- **Deterministic:** *"Use a centered Modal (`max-w: 480px`) only for destructive confirmations or forms with `<= 4` input fields and zero internal scrolling. Forms with `5 to 12` fields or entity inspection use a Slide-Over Drawer (`width: 540px`). Workflows with `> 12` fields or multi-step sections use a dedicated route."*

---

## 3. Spatial budget math

A layout specification that does not add up mathematically forces the agent to improvise CSS overrides. Every `UX.md` proves its viewport budget across desktop (`1280px`), tablet (`768px`), and mobile (`375px`):

```text
Sum(Fixed Navigation Panels + Inspector Panels + Outer Padding + Content Min-Width) <= Viewport Width
```

Whenever fixed panels plus minimum content width exceed a breakpoint, `UX.md` declares the exact collapse priority (which panel folds into a sheet, bottom bar, or overlay first).

---

## 4. Zero dead ends and zero ghost controls

Every interactive element and route in an interface is a contract with the user. `UX.md` enforces two structural invariants:

1. **Bi-directional route reachability:** Every route in the route graph maps to a named page archetype, declares at least one entry trigger (sidebar, command palette, row action), and declares an explicit exit or cancel fallback.
2. **No ghost controls:** Controls without a backing route or handler (`href="#"`, `onClick={() => {}}`) are forbidden. Unbuilt roadmap features are either omitted from the DOM or rendered as `disabled` with a tooltip stating the target milestone.

---

## 5. The 4-state view contract and `F5` survival

No data-driven screen is complete when only its populated state renders:

1. **Four structural states per view:** `Loading` (geometry-matched skeleton with zero layout shift), `Empty` (explanation plus primary creation or filter-reset CTA), `Error` (failure reason plus in-place retry action), and `Populated` (truncation, empty-cell placeholder token, and pagination or virtualization rules).
2. **State persistence (`F5` and Browser `Back`):** Active tabs, search queries, filters, pagination, and open detail drawers synchronize with URL parameters so browser refresh (`F5`), deep links, and the browser `Back` button preserve user context.

---

## 6. Code layout primitives

Markdown documentation can still be bypassed if an agent writes ad-hoc `<div className="flex max-w-6xl p-6 ...">` wrappers inside individual route files. `UX.md` bridges specification and implementation by declaring mandatory layout primitives (`<AppShell>`, `<PageHeader>`, `<PageSection>`, `<DataStateBoundary>`) that every route file composes.
