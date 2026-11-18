# Mandatory Layout Primitives (Code Enforcement Bridge)

A `UX.md` specification only prevents UI drift when every route in the codebase is built from shared **Layout Primitives** rather than ad-hoc `<div className="flex max-w-6xl p-6 ...">` wrappers.

Every generated `UX.md` (Section 10) must define the project's **4 core layout primitives** and synchronize their reference implementation into `.ai/05-patterns.md` (if present).

---

## 1. `<AppShell>` — Persistent Frame & Scroll Owner

**Responsibility:** Enforces the exact sidebar/topbar/inspector geometry from Section 1 and owns the primary scroll container from Section 2. Individual pages must NEVER render their own outer navigation chrome or `100vh` overflow wrappers.

```tsx
// Reference Contract (React / Next.js / Vue / Svelte equivalent)
export interface AppShellProps {
  activeNavId: string;
  inspector?: React.ReactNode;     // Optional right slide-over / split panel
  banner?: React.ReactNode;        // System-wide alert banner slot (z-20)
  children: React.ReactNode;       // Scrollable main canvas content
}
```

**Hard Invariants:**
- Owns responsive sidebar collapse below `shell_budget.collapse_priority`.
- Locks body scroll when mobile navigation sheet or modal is active.

---

## 2. `<PageHeader>` — Deterministic Title, Breadcrumb & Primary CTA Slot

**Responsibility:** Guarantees that every page places its title, breadcrumb trail, status badge, and Primary CTA at the exact same pixel coordinates.

```tsx
export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  badge?: React.ReactNode;
  primaryAction?: React.ReactNode;   // Single high-salience CTA (top-right)
  secondaryActions?: React.ReactNode;
}
```

**Hard Invariants:**
- Never place a page's primary creation CTA at the bottom of a data table when `<PageHeader primaryAction={...} />` is used.
- At `< 768px`, `primaryAction` either remains top-right (compact) or docks full-width cleanly below the title.

---

## 3. `<PageSection>` — Max-Width, Grid & Vertical Rhythm Enforcer

**Responsibility:** Enforces the page archetype's maximum width (`ListIndex: 1280px`, `WorkspaceDetail: 1280px`, `FocusedForm: 640px`) and consistent section spacing from `DESIGN.md`.

```tsx
export interface PageSectionProps {
  archetype: "list-index" | "workspace-detail" | "focused-form" | "full-bleed";
  toolbar?: React.ReactNode;         // Sticky filter / search / bulk-action bar
  children: React.ReactNode;
}
```

---

## 4. `<DataStateBoundary>` — Compiler-Enforced 4-State Matrix

**Responsibility:** Forces every data-fetching view or section to explicitly supply its `Loading`, `Empty`, and `Error` states alongside the `Populated` children. If a developer or AI agent forgets the empty or error state, the type checker immediately flags the missing prop.

```tsx
export interface DataStateBoundaryProps<T> {
  status: "loading" | "error" | "success";
  data: T | null | undefined;
  isEmpty: (data: T) => boolean;
  skeleton: React.ReactNode;         // Geometry-matched skeleton (CLS = 0)
  emptyState: {
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
  };
  errorState: {
    message: string;
    onRetry: () => void;             // Mandatory in-place retry callback
  };
  children: (data: T) => React.ReactNode;
}
```

**Hard Invariants:**
- Delays showing `skeleton` for `< 150ms` cached reads where supported, or reserves exact `min-height` to guarantee `CLS = 0`.
- `errorState` renders an in-place retry button (`onRetry`) and never auto-dismisses.
