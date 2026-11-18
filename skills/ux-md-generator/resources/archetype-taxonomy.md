# Product & Platform Archetype Taxonomy

When synthesizing a `UX.md` file in Phase 1, classify the project along two axes: **Platform Profile** (how the runtime renders and receives input) and **Product Archetype** (how users navigate and manipulate domain entities).

---

## 1. Platform Profiles (`platform_profile`)

| Profile ID | Target Runtimes | Scroll Owner Default | Primary Overlay Pattern | Navigation & Input Specifics |
| :--- | :--- | :--- | :--- | :--- |
| `web-app` | Next.js, React, Vue, Svelte, Astro, SPA/SSR Web | `inner-canvas` (app shell) or `window` (marketing/docs) | Slide-Over Drawer (`540px`) + Centered Modal (`480px`) | Deep-linked URL query state (`?tab=`, `?q=`), responsive breakpoints (`1280` / `1024` / `768` / `375`), pointer + keyboard shortcuts. |
| `mobile-native` | React Native, Expo, Flutter, SwiftUI, Kotlin | Active screen scroll view with Safe-Area insets | Bottom Sheet (`snapPoints: 50%, 90%`) | Bottom Tab Bar (`<= 5` tabs) + Stack push/pop, edge swipe-back gesture, mandatory keyboard avoidance on input focus, `>= 44x44px` touch targets. |
| `desktop-app` | Tauri, Electron, macOS/Windows Native | `inner-canvas` or `split-pane` (fixed window viewport) | Slide-Over Inspector or Secondary Utility Window | Custom titlebar drag region (`36px`), native menu bar accelerators (`Cmd/Ctrl+...`), local/offline connection status pill in footer/sidebar. |
| `terminal-tui` | Ink, Bubbletea, Ratatui, Textual | Active focused pane buffer | Centered Framed Overlay Box or Bottom Prompt Bar | Minimum terminal size contract (`80 cols x 24 rows`), persistent bottom keybinding legend bar (`[Tab] Switch Pane  [q] Quit  [/] Filter`). |

---

## 2. Product Archetypes (`archetype`)

### A. `b2b-saas-workspace` (Reference: Linear, Notion, Attio)
- **App Shell:** Collapsible left sidebar (`240px`) + compact top context bar (`48px`, breadcrumbs + primary action + filter trigger) + scrollable main workspace canvas (`inner-canvas`).
- **Core Page Archetypes:**
  1. `ListIndex` — Filter/search bar + keyboard-navigable data table or grouped list + slide-over detail preview (`?inspect=<id>`).
  2. `WorkspaceDetail` — 2-column asymmetric split: primary entity editor/timeline (`flex-1`, `min-w: 640px`) + sticky metadata/properties sidebar (`300px`).
  3. `SettingsForm` — Constrained single column (`max-w: 640px`) with grouped fieldsets and explicit save/discard action bar.
- **Signature UX Laws:** Command Palette (`Cmd/Ctrl+K`) for global navigation; quick edits happen inline or via Slide-Over Drawer (`540px`) without losing list scroll position.

### B. `ai-chat-canvas` (Reference: ChatGPT Canvas, Claude Artifacts, Cursor Web)
- **App Shell:** Collapsible history rail (`260px`) + split-pane workspace (`split-pane`): conversational stream pane (`min-w: 420px`) alongside an interactive artifact/preview canvas (`flex-1`, `min-w: 520px`, collapsible).
- **Core Page Archetypes:**
  1. `PromptStreamCanvas` — Sticky bottom prompt composer + auto-scrolling message stream (with manual scroll-lock break) + synchronized side artifact stage.
  2. `HistoryLibrary` — Searchable grid/list of past threads/artifacts with instant preview drawer.
  3. `ConfigurationModalOrView` — Model/system-instructions and API/integration settings (`max-w: 680px`).
- **Signature UX Laws:** Mandatory `Streaming / Partial` view state in Section 6 (token streaming indicator + stop-generation button + partial markdown recovery on network drop).

### C. `analytics-dashboard` (Reference: Stripe Dashboard, Datadog, PostHog)
- **App Shell:** Left navigation (`220px`) + sticky top global time-range & environment filter bar (`56px`, synced to `?from=&to=&env=`) + scrollable dashboard canvas.
- **Core Page Archetypes:**
  1. `MetricOverview` — Top KPI summary strip (`3–4` cards) + primary time-series chart + breakdown data table below.
  2. `ExplorerDrilldown` — Query/facet builder bar + high-density tabular log/event viewer (`tabular-nums`) + row-click inspector drawer (`600px`).
  3. `ReportConfig` — Form/builder view for alerts, webhooks, or scheduled exports.
- **Signature UX Laws:** Time range and active filters MUST persist in URL query parameters across page transitions; charts and KPI cards must reserve fixed heights (`min-h: 280px`) to prevent CLS during query refreshes.

### D. `ecommerce-storefront` (Reference: Shopify Plus, Apple Store, Airbnb)
- **App Shell:** Sticky top utility & category header (`64px`) with search trigger and persistent cart badge + document scroll (`window`) + slide-over Cart Drawer (`420px`).
- **Core Page Archetypes:**
  1. `DiscoveryCatalog` — Faceted filter sidebar (`240px` on desktop, bottom filter sheet on `< 1024px`) + responsive product/listing card grid (`2–4` columns) + URL-synced sort/pagination.
  2. `ProductShowcase` — 2-column media gallery (`55%`) + sticky purchase/configuration box (`45%`) with variant selectors and immediate stock/price feedback.
  3. `CheckoutFunnel` — Distraction-free header (logo + back to cart only) + single-column step progression (`max-w: 560px`) + sticky order summary (`380px`).
- **Signature UX Laws:** Adding an item opens or pulses the Cart Drawer without hard page reload; filter facets update URL params (`?size=m&sort=price_asc`) with instant skeleton feedback.

### E. `developer-tool` (Reference: Supabase Studio, Vercel Dashboard, GitHub)
- **App Shell:** Project/Org context switcher header (`48px`) + secondary section tabs or compact icon rail (`56px` / `220px`) + high-density workspace pane.
- **Core Page Archetypes:**
  1. `ResourceList` — Environment status header + searchable resource cards/rows + deployment/status badges.
  2. `InspectorWorkbench` — Split schema/code editor + output/log console pane + collapsible right schema/docs drawer.
  3. `AccessAndKeys` — High-security token/secret management table with copy-once modals and Tier-2 destructive revocation modals.
- **Signature UX Laws:** Monospace identifiers (`font-mono`) with one-click copy + `2000ms` inline checkmark feedback (no toast spam on copy).
