# Mandatory Layout Primitives (Code Enforcement Bridge)

A `UX.md` specification prevents UI drift only when every route in the codebase is built from shared layout primitives rather than ad-hoc `<div className="flex max-w-6xl p-6 ...">` wrappers.

Every generated `UX.md` (Section 10) defines the project's four core layout primitives and their required props contract.

---

## 1. `<AppShell>`: Persistent frame and scroll owner

**Responsibility:** Enforces the sidebar, topbar, and inspector geometry from Section 1 and owns the primary scroll container from Section 2. Individual pages do not render outer navigation chrome or `100vh` overflow wrappers.

```tsx
export interface AppShellProps {
  activeNavId: string;
  inspector?: React.ReactNode;
  banner?: React.ReactNode;
  children: React.ReactNode;
}
```

**Invariants:**
- Owns responsive panel collapse below `shell_budget.collapse_priority`.
- Reserves scroll padding (`padding-bottom` plus `env(safe-area-inset-bottom)`) whenever a mobile bottom navigation bar is fixed.
- Locks background scroll when a mobile navigation sheet or modal is open.

---

## 2. `<PageHeader>`: Title, breadcrumb, and primary CTA slot

**Responsibility:** Places every page's title, breadcrumb trail, status badge, and primary CTA at identical pixel coordinates.

```tsx
export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  badge?: React.ReactNode;
  primaryAction?: React.ReactNode;
  secondaryActions?: React.ReactNode;
}
```

**Invariants:**
- Do not place a page's primary creation CTA at the bottom of a data table when `<PageHeader primaryAction={...} />` is used.
- Below `768px`, `primaryAction` either stays top-right (compact) or stacks full-width below the title with `>= 8px` gap from secondary controls.

---

## 3. `<PageSection>`: Max-width, grid, and vertical rhythm wrapper

**Responsibility:** Enforces the page archetype's maximum width (`ListIndex: 1280px`, `WorkspaceDetail: 1280px`, `FocusedForm: 640px`) and consistent section spacing from `DESIGN.md`.

```tsx
export interface PageSectionProps {
  archetype: "list-index" | "workspace-detail" | "focused-form" | "full-bleed";
  toolbar?: React.ReactNode;
  children: React.ReactNode;
}
```

---

## 4. `<DataStateBoundary>`: Type-checked 4-state matrix

**Responsibility:** Requires every data-fetching view or section to supply its `Loading`, `Empty`, and `Error` states alongside the `Populated` children. If a developer or AI agent omits the empty or error state, the type checker flags the missing property.

```tsx
export interface DataStateBoundaryProps<T> {
  status: "loading" | "error" | "success";
  data: T | null | undefined;
  isEmpty: (data: T) => boolean;
  skeleton: React.ReactNode;
  emptyState: {
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
  };
  errorState: {
    message: string;
    onRetry: () => void;
  };
  children: (data: T) => React.ReactNode;
}
```

**Invariants:**
- Suppresses `skeleton` for cached reads completing in `< 150ms`, and reserves matching container dimensions (`CLS = 0`) for requests `>= 150ms`.
- `errorState` renders a persistent in-place retry action (`onRetry`) and does not auto-dismiss.
