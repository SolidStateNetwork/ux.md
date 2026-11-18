# Product and Platform Archetype Taxonomy

When synthesizing a `UX.md` file in Phase 1, classify the project along two axes: **Platform Profile** (how the runtime renders and receives input) and **Product Archetype** (how users navigate and manipulate domain entities).

---

## 1. Platform profiles (`platform_profile`)

| Profile ID | Target runtimes | Scroll owner default | Primary overlay pattern | Navigation and input specifics |
| :--- | :--- | :--- | :--- | :--- |
| `web-app` | Next.js, React, Vue, Svelte, Astro, SPA/SSR Web | `inner-canvas` (app shell) or `window` (marketing/docs) | Slide-Over Drawer (`540px`) + Centered Modal (`480px`) | Deep-linked URL query state (`?tab=`, `?q=`), responsive breakpoints (`1280` / `1024` / `768` / `375`), pointer and keyboard shortcuts. |
| `mobile-native` | React Native, Expo, Flutter, SwiftUI, Kotlin | Active screen scroll view with Safe-Area insets | Bottom Sheet (`snapPoints: 50%, 90%`) | Bottom Tab Bar (`<= 5` tabs) with reserved bottom scroll padding, stack push/pop, edge swipe-back gesture, keyboard avoidance on input focus, `>= 44x44px` touch targets with `>= 8px` gap. |
| `desktop-app` | Tauri, Electron, macOS/Windows Native | `inner-canvas` or `split-pane` (fixed window viewport) | Slide-Over Inspector or Secondary Utility Window | Custom titlebar drag region (`36px`), native menu bar accelerators (`Cmd/Ctrl+...`), local/offline connection status pill in footer or sidebar. |
| `terminal-tui` | Ink, Bubbletea, Ratatui, Textual | Active focused pane buffer | Centered Framed Overlay Box or Bottom Prompt Bar | Minimum terminal size contract (`80 cols x 24 rows`), persistent bottom keybinding legend bar (`[Tab] Switch Pane  [q] Quit  [/] Filter`). |

---

## 2. Product archetypes (`archetype`)

### A. `b2b-saas-workspace` (Linear, Notion, Attio pattern)
- **App shell:** Collapsible left sidebar (`240px`), compact top context bar (`48px`, breadcrumbs, primary action, filter trigger), and scrollable main workspace canvas (`inner-canvas`).
- **Core page archetypes:**
  1. `ListIndex`: Filter/search bar, keyboard-navigable data table or grouped list, and slide-over detail preview (`?inspect=<id>`).
  2. `WorkspaceDetail`: 2-column asymmetric split with primary entity editor/timeline (`flex-1`, `min-w: 580px`) and sticky metadata sidebar (`300px`).
  3. `FocusedForm`: Constrained single column (`max-w: 640px`) with grouped fieldsets and save/discard action bar.
- **Structural rules:** Command Palette (`Cmd/Ctrl+K`) for global navigation; quick edits happen inline or via Slide-Over Drawer (`540px`) without losing list scroll position.

### B. `ai-chat-canvas` (ChatGPT Canvas, Claude Artifacts, Cursor Web pattern)
- **App shell:** Collapsible history rail (`260px`) and split-pane workspace (`split-pane`): conversational stream pane (`min-w: 420px`) alongside an interactive artifact/preview canvas (`flex-1`, `min-w: 520px`, collapsible).
- **Core page archetypes:**
  1. `PromptStreamCanvas`: Sticky bottom prompt composer, auto-scrolling message stream (with manual scroll-lock break), and synchronized side artifact stage.
  2. `HistoryLibrary`: Searchable list of past threads and artifacts with preview drawer.
  3. `FocusedSettings`: Model, system-instruction, and integration settings (`max-w: 640px`).
- **Structural rules:** Requires a `Streaming / Partial` view state in Section 6 (token streaming indicator, stop-generation button, and partial output preservation on network interruption).

### C. `analytics-dashboard` (Stripe Dashboard, Datadog, PostHog pattern)
- **App shell:** Left navigation (`220px`), sticky top global time-range and environment filter bar (`56px`, synced to `?from=&to=&env=`), and scrollable dashboard canvas.
- **Core page archetypes:**
  1. `MetricOverview`: Top KPI summary strip (`3 to 4` cards), primary time-series chart, and breakdown data table below.
  2. `ExplorerDrilldown`: Query/facet builder bar, high-density tabular log/event viewer (`tabular-nums`), and row-click inspector drawer (`600px`).
  3. `ReportConfig`: Form builder view for alerts, webhooks, or scheduled exports.
- **Structural rules:** Time range and active filters persist in URL query parameters across page transitions; charts and KPI cards reserve fixed heights (`min-h: 280px`) to prevent layout shift during query refreshes.

### D. `ecommerce-storefront` (Shopify Plus, Apple Store, Airbnb pattern)
- **App shell:** Sticky top utility and category header (`64px`) with search trigger and persistent cart badge, document scroll (`window`), and slide-over Cart Drawer (`420px`).
- **Core page archetypes:**
  1. `DiscoveryCatalog`: Faceted filter sidebar (`240px` on desktop, bottom filter sheet below `1024px`), responsive product card grid (`2 to 4` columns), and URL-synced sort/pagination.
  2. `ProductShowcase`: 2-column media gallery (`55%`) and sticky purchase configuration box (`45%`) with variant selectors and immediate stock/price feedback.
  3. `CheckoutFunnel`: Focused header (logo and return-to-cart link only), single-column step progression (`max-w: 560px`), and sticky order summary (`380px`).
- **Structural rules:** Adding an item opens or updates the Cart Drawer without a hard page reload; filter facets update URL params (`?size=m&sort=price_asc`) with skeleton feedback.

### E. `developer-tool` (Supabase Studio, Vercel Dashboard, GitHub pattern)
- **App shell:** Project/organization context switcher header (`48px`), secondary section tabs or compact icon rail (`56px` / `220px`), and high-density workspace pane.
- **Core page archetypes:**
  1. `ResourceList`: Environment status header, searchable resource rows, and deployment status badges.
  2. `InspectorWorkbench`: Split schema/code editor, output/log console pane, and collapsible right documentation drawer.
  3. `AccessAndKeys`: Token and secret management table with copy-once modals and Tier-2 destructive revocation modals.
- **Structural rules:** Monospace identifiers (`font-mono`) with one-click copy and `2000ms` inline checkmark feedback (no toast notification on clipboard copy).
