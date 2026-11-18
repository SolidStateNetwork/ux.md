#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);

function getFlag(name, fallback = null) {
  const idx = args.indexOf(name);
  if (idx !== -1 && args[idx + 1] && !args[idx + 1].startsWith('--')) {
    return args[idx + 1];
  }
  return fallback;
}

const PRESET_MAP = {
  linear: {
    archetype: 'b2b-saas-workspace',
    defaultProject: 'Linear-Style Issue Workspace'
  },
  'chatgpt-canvas': {
    archetype: 'ai-chat-canvas',
    defaultProject: 'AI Chat & Artifact Canvas'
  },
  'claude-artifacts': {
    archetype: 'ai-chat-canvas',
    defaultProject: 'Conversational Artifact Studio'
  },
  'stripe-dashboard': {
    archetype: 'analytics-dashboard',
    defaultProject: 'Financial & Telemetry Dashboard'
  },
  datadog: {
    archetype: 'analytics-dashboard',
    defaultProject: 'Observability & Metrics Console'
  },
  'shopify-storefront': {
    archetype: 'ecommerce-storefront',
    defaultProject: 'Direct-to-Consumer Storefront'
  },
  'supabase-studio': {
    archetype: 'developer-tool',
    defaultProject: 'Database & Cloud Workbench'
  },
  'vercel-console': {
    archetype: 'developer-tool',
    defaultProject: 'Deployment & Edge Console'
  }
};

const VALID_ARCHETYPES = new Set([
  'b2b-saas-workspace',
  'ai-chat-canvas',
  'analytics-dashboard',
  'ecommerce-storefront',
  'developer-tool'
]);

if (args.includes('--list-presets')) {
  console.log('Available UX.md Archetypes:');
  for (const arch of VALID_ARCHETYPES) {
    console.log(`  - ${arch}`);
  }
  console.log('\nAvailable Product Presets (--preset <name>):');
  for (const [presetName, meta] of Object.entries(PRESET_MAP)) {
    console.log(`  - ${presetName.padEnd(20)} -> ${meta.archetype} (${meta.defaultProject})`);
  }
  process.exit(0);
}

const scanFile = getFlag('--from-scan');
const scanData = scanFile && fs.existsSync(scanFile) ? JSON.parse(fs.readFileSync(scanFile, 'utf8')) : null;

const requestedPreset = getFlag('--preset');
if (requestedPreset && !PRESET_MAP[requestedPreset]) {
  console.error(
    `FAIL: Unsupported preset "${requestedPreset}". Valid presets: ${Object.keys(PRESET_MAP).join(', ')}`
  );
  process.exit(1);
}

const presetEntry = requestedPreset ? PRESET_MAP[requestedPreset] : null;
const requestedArchetype = getFlag(
  '--archetype',
  presetEntry?.archetype || scanData?.inferred_archetype || 'b2b-saas-workspace'
);

if (!VALID_ARCHETYPES.has(requestedArchetype)) {
  console.error(
    `FAIL: Unsupported archetype "${requestedArchetype}". Valid archetypes: ${Array.from(VALID_ARCHETYPES).join(', ')}`
  );
  process.exit(1);
}

const projectName = getFlag(
  '--project',
  scanData?.project || presetEntry?.defaultProject || path.basename(process.cwd())
);
const outputPath = path.resolve(process.cwd(), getFlag('--output', 'UX.md'));
const hasDesignMd =
  scanData?.has_design_md ?? fs.existsSync(path.join(path.dirname(outputPath), 'DESIGN.md'));
const tokenSource = hasDesignMd ? 'DESIGN.md' : 'standalone';

const repoExamplesDir = path.resolve(__dirname, '..', '..', '..', 'examples', requestedArchetype, 'UX.md');

let content = '';
if (fs.existsSync(repoExamplesDir)) {
  content = fs.readFileSync(repoExamplesDir, 'utf8');
  content = content
    .replace(/^project:\s*"[^"]*"/m, `project: "${projectName}"`)
    .replace(/^token_source:\s*"[^"]*"/m, `token_source: "${tokenSource}"`)
    .replace(/^#\s+UX\.md:.*$/m, `# UX.md: ${projectName}`);
} else {
  content = buildArchetypeSpec(requestedArchetype, projectName, tokenSource);
}

fs.writeFileSync(outputPath, content, 'utf8');
const presetNote = requestedPreset ? `, preset: ${requestedPreset}` : '';
console.log(
  `PASS: Generated UX.md (${requestedArchetype}${presetNote}, token_source: ${tokenSource}) at ${path.relative(process.cwd(), outputPath) || 'UX.md'}`
);

function buildArchetypeSpec(archetype, project, tokenSrc) {
  const isSplit = archetype === 'ai-chat-canvas';
  const isWindow = archetype === 'ecommerce-storefront';
  const scrollOwner = isSplit ? 'split-pane' : isWindow ? 'window' : 'inner-canvas';

  return `---
spec_version: "1.0"
project: "${project}"
platform_profile: "web-app"
archetype: "${archetype}"
token_source: "${tokenSrc}"
scroll_owner: "${scrollOwner}"
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

# UX.md: ${project}

## 0. Product & Domain Topology
- **Core value loop:** Users navigate primary collections in the main workspace, inspect or mutate records inside a slide-over drawer (\`?inspect=<id>\`), and complete configuration tasks in focused single-column views.
- **Auth and role boundary:** Authenticated multi-user workspace with role-based permissions.
- **Platform profile:** \`web-app\` (\`Pointer + Keyboard First\` with touch parity below \`1024px\`).

## 1. Spatial Architecture & App Shell

\`\`\`text
+-----------------------------------------------------------------------------------+
| [Sidebar: 240px Fixed] | [Sticky PageHeader: 48px Height (Breadcrumbs + Primary)] |
|                        +----------------------------------------------------------+
| - Primary Navigation   | [Sticky Filter / Search Toolbar: 40px Height]            |
| - Search / Cmd+K       +----------------------------------------------------------+
| - Core Views           |  Main Scrollable Canvas (scroll_owner: ${scrollOwner})   |
| - Settings             |  Padding: 24px Left / 24px Right (48px total outer)      |
|                        |  Content Min-Width: 720px | Max-Width: 1280px            |
+-----------------------------------------------------------------------------------+
\`\`\`

| Breakpoint | Fixed Chrome (\`px\`) | Outer Padding (\`px\`) | Available Content Width (\`px\`) | Collapse Action |
| :--- | :--- | :--- | :--- | :--- |
| \`>= 1280px\` (Desktop) | \`240px\` (Left Nav) | \`48px\` (\`24px\` x 2) | \`992px\` (\`>= 720px\` min) | Persistent left rail; Inspector opens as \`540px\` right overlay drawer. |
| \`768px to 1023px\` (Tablet) | \`0px\` (Nav collapsed) | \`32px\` (\`16px\` x 2) | \`736px to 991px\` | Left Nav collapses into an off-canvas sheet (\`260px\`) via labeled \`Menu\` button. |
| \`<= 767px\` (Mobile) | \`0px\` (Bottom Bar \`56px\`) | \`24px\` (\`12px\` x 2) | \`351px to 743px\` | Left Nav moves to 4-item Bottom Bar (\`56px\` with \`pb-14\` + safe-area reserved on canvas). |

## 2. Scroll, Viewport & Z-Index Contract
- **Scroll ownership:** \`${scrollOwner}\` owns the single primary vertical scrollbar. Nested full-height vertical scrollbars inside route components are forbidden.
- **Sticky regions:** \`<PageHeader>\` (\`48px\`) and active filter bar (\`40px\`) remain pinned at \`z-index: 10\`.
- **CLS protection:** List rows reserve \`40px\` height per row and summary cards reserve \`96px\` height during async loads.

| Layer Name | Z-Index | Assigned Components |
| :--- | :--- | :--- |
| \`base\` | \`0\` | Standard canvas flow, tables, cards |
| \`sticky\` | \`10\` | \`<PageHeader>\`, sticky filter bar, sticky table header |
| \`navigation\` | \`20\` | Fixed left sidebar, mobile bottom bar, system status banner |
| \`drawer\` | \`30\` | Right slide-over inspector drawer (\`540px\`), mobile navigation sheet |
| \`modal\` | \`40\` | Centered command palette (\`640px\`), Tier-2 destructive confirm modal (\`480px\`) |
| \`popover\` | \`50\` | Select comboboxes, date pickers, context menus |
| \`toast\` | \`60\` | Bottom-right action undo toasts (\`4000ms\`) |
| \`tooltip\` | \`70\` | Keyboard shortcut hints and truncated text tooltips |

## 3. Core Page Archetypes (Blueprints)

### Archetype: ListIndex
- **Purpose and max-width:** Filterable primary collection list or table (\`max-w: 1280px\`).
- **Primary CTA position:** Top-right slot of \`<PageHeader>\` (\`+ Create Item\`).

### Archetype: WorkspaceDetail
- **Purpose and max-width:** 2-column entity workspace (\`max-w: 1280px\`, \`flex-1\` main column + \`300px\` metadata rail).
- **Primary CTA position:** Top-right slot of \`<PageHeader>\`.

### Archetype: FocusedForm
- **Purpose and max-width:** Single-column configuration and settings form (\`max-w: 640px\`).
- **Primary CTA position:** Sticky bottom-right action bar (\`Save Changes\` and \`Discard\`).

## 4. Navigation, Route Graph & URL Persistence

\`\`\`mermaid
flowchart LR
  Home["/ (ListIndex)"] -->|"?inspect=item_1"| Drawer["Inspector Drawer (540px)"]
  Home -->|"Click Row"| Detail["/items/:id (WorkspaceDetail)"]
  Home -->|"Sidebar: Settings"| Settings["/settings (FocusedForm)"]
  Detail -->|"Breadcrumb / Esc"| Home
  Settings -->|"Back to Workspace"| Home
\`\`\`

| Route | Archetype | Entry Trigger | Primary Action | Exit / Cancel Fallback |
| :--- | :--- | :--- | :--- | :--- |
| \`/\` | \`ListIndex\` | Sidebar root link or app launch | Filter items or open Inspector Drawer (\`?inspect=\`) | Clear active filters |
| \`/items/:id\` | \`WorkspaceDetail\` | Row click from \`/\` | Edit entity fields and save | Return to \`/\` preserving URL query filters |
| \`/settings\` | \`FocusedForm\` | Sidebar \`Settings\` link | Save configuration changes | Discard edits and return to \`/\` |

### State persistence matrix (\`F5\` and Back-button contract)

| State Category | Storage Location | Parameter / Key Example | Reset Trigger |
| :--- | :--- | :--- | :--- |
| Active Filters, Search & Sort | \`URL Query\` | \`?q=search&status=active&page=1\` | Clicking \`Reset Filters\` button |
| Open Inspector Drawer Item | \`URL Query\` | \`?inspect=item_1\` | Pressing \`Esc\` or close button removes \`?inspect\` |
| Sidebar Collapsed & Theme | \`LocalStorage\` | \`ux.sidebar_collapsed\`, \`ux.theme\` | Explicit user toggle |
| Unsaved Form Inputs | \`Ephemeral Memory\` | Component state + \`isDirty\` guard | Form submission or confirmed discard |

## 5. Overlay & Feedback Decision Matrix

| Pattern | Trigger Condition & Field Limit | Dimensions | Dismiss & Dirty-State Behavior |
| :--- | :--- | :--- | :--- |
| \`Centered Modal\` | Quick creation or Tier-2 destructive confirmation (\`<= 4\` fields, 0 scroll) | \`max-w: 480px\` | \`Esc\` or backdrop closes when \`isDirty === false\`; prompts confirm if dirty |
| \`Slide-Over Drawer\` | Entity inspection or editing (\`5 to 12\` fields) via \`?inspect=id\` | \`width: 540px\`, \`100dvh\` | \`Esc\` removes \`?inspect=\`; intercepts close when \`isDirty === true\` |
| \`Dedicated Route\` | Multi-section workflows (\`> 12\` fields) or settings | \`max-w: 640px\` or \`1280px\` | Router guard prompts on unsaved edits |
| \`Auto-Dismiss Toast\` | Background confirmation or Tier-1 reversible action with \`[Undo]\` | \`width: 360px\`, bottom-right | Auto-dismisses after \`4000ms\` |

## 6. Mandatory View States (4-State Matrix)

| View / Component | \`Loading\` (Skeleton Geometry) | \`Empty\` (Copy + Primary CTA) | \`Error\` (Message + Retry Action) | \`Populated\` (Density & Overflow) |
| :--- | :--- | :--- | :--- | :--- |
| \`/\` (\`ListIndex\`) | 10 shimmer rows (\`40px\` height each) matching column widths (\`CLS = 0\`) | Centered \`420px\` block: *"No items match your active filters."* + \`[+ Create First Item]\` CTA | Inline alert card with \`[Retry Fetch]\` button | \`40px\` rows, \`25 rows/page\`, title \`min-w-0 truncate\` |
| \`/items/:id\` (\`WorkspaceDetail\`) | Two-column skeleton: \`32px\` title bar + \`160px\` body block on left; 6 property rows on right | Activity empty prompt: *"No activity recorded yet."* | Section error banner with \`[Reload]\` + \`[Back]\` | Primary content column + sticky \`300px\` metadata rail |
| \`/settings\` (\`FocusedForm\`) | 4 form fieldset skeletons (\`64px\` height each) within \`640px\` width | Optional integration list empty prompt + \`[+ Connect]\` CTA | Persistent top validation banner + \`[Retry Save]\` | Grouped fieldsets (\`24px\` gap) with sticky save/discard bar |

## 7. Mutation, Form & Permission Ergonomics
- **Validation timing:** Validate on \`submit\` and field \`blur\`; clear field error state immediately on \`onChange\` once valid.
- **Submit locking:** Primary submit buttons lock (\`disabled + aria-busy="true"\`) during flight while preserving button width.
- **Dirty-state guard (\`isDirty\`):** Intercept backdrop click and \`Esc\` whenever \`isDirty === true\` with an explicit discard prompt.
- **Destructive action tiers:** Tier 1 (reversible) executes immediately with a \`4000ms\` \`[Undo]\` Toast; Tier 2 (irreversible) requires a \`480px\` Confirmation Modal.
- **Permission and entitlement gates:** Unauthorized role actions are hidden (\`null\`); unmet prerequisites render \`disabled\` with an explanatory tooltip; plan-gated features show a \`Lock\` badge and upgrade popover.

## 8. Real-Data Stress, Density & Truncation
- **Collection scaling:** Cursor or numbered pagination (\`25 items/page\`) synced to URL query parameters.
- **Text overflow rules:** Dynamic titles enforce \`min-w-0 truncate\` (1 line); descriptions use \`line-clamp-2\`.
- **Missing or null data fallback:** Empty cells render \`-\` (never literal \`null\`, \`undefined\`, or \`N/A\`).
- **Numeric and temporal alignment:** All numeric columns, counts, currencies, and dates enforce \`font-variant-numeric: tabular-nums\` and right-alignment.

## 9. Responsive Reflow & Input Choreography
- **Breakpoint collapse sequence:** Below \`1280px\`, the right drawer overlays the canvas; below \`1024px\`, the \`240px\` left sidebar folds into an off-canvas sheet opened by a labeled \`Menu\` button; below \`768px\`, tables convert into stacked 3-field summary cards with zero horizontal overflow.
- **Touch targets and hover parity:** All interactive controls enforce \`>= 44x44px\` hit areas with \`>= 8px\` spacing; hover-only desktop actions expose a persistent tap trigger on touch viewports.
- **Keyboard and focus choreography:** \`Cmd/Ctrl+K\` opens global search; overlays trap focus on open and restore focus to the trigger element on \`Esc\` close.

## 10. Mandatory Layout Primitives (Code Contract)

| Primitive | Required Usage | Forbidden Bypass |
| :--- | :--- | :--- |
| \`<AppShell>\` | Wraps all routes; manages \`240px\` navigation rail, mobile sheet, and \`${scrollOwner}\` scroll. | Custom \`h-screen overflow-auto\` wrappers inside page files. |
| \`<PageHeader>\` | First child of every route; renders breadcrumbs, title, and top-right \`primaryAction\`. | Placing primary creation CTAs below tables or in ad-hoc divs. |
| \`<PageSection>\` | Enforces \`max-w: 1280px\` (\`ListIndex\`, \`WorkspaceDetail\`) or \`max-w: 640px\` (\`FocusedForm\`). | Arbitrary container widths across individual pages. |
| \`<DataStateBoundary>\` | Wraps every async data region; requires \`skeleton\`, \`emptyState\`, and \`errorState\` props. | Early \`if (isLoading) return <p>Loading...</p>\` without empty/error handlers. |

## 11. Project Do's, Don'ts & Agent Prompt Guide

### Do's and Don'ts (threshold rules)
- **DO** synchronize active filters, tabs, pagination, and drawer inspection (\`?inspect=id\`) in URL query parameters.
- **DO** use the \`540px\` Slide-Over Drawer for forms with \`5 to 12\` fields and centered Modals (\`480px\`) only for \`<= 4\` fields.
- **DO** enforce \`min-w-0 truncate\` on dynamic text and \`tabular-nums\` on numeric columns.
- **DO** intercept \`Esc\` and backdrop clicks whenever a form has \`isDirty === true\`.
- **DO** suppress loading indicators for cached reads \`< 150ms\` and render geometry-matched skeletons for \`>= 150ms\`.
- **DON'T** open a centered Modal for any form exceeding \`4\` input fields.
- **DON'T** auto-dismiss error messages in toasts.
- **DON'T** render ghost buttons (\`onClick={() => {}}\` or \`href="#"\`).
- **DON'T** introduce nested full-height vertical scrollbars inside \`${scrollOwner}\`.
- **DON'T** render literal \`null\`, \`undefined\`, or \`N/A\` in data cells (always use \`-\`).

### Pre-commit agent checklist
1. Does the view compose \`<AppShell>\`, \`<PageHeader>\`, \`<PageSection>\`, and \`<DataStateBoundary>\`?
2. Is the route registered in Section 4 of \`UX.md\` with a valid Section 3 \`Archetype\`, \`Entry Trigger\`, and \`Exit / Cancel Fallback\`?
3. Are all 4 states (\`Loading\`, \`Empty\`, \`Error\`, \`Populated\`) implemented with \`CLS = 0\` geometry?
4. Do filters, tabs, and open detail drawers survive a browser refresh (\`F5\`) and \`Back\` button press?
5. Does \`node .agents/skills/ux-md-generator/scripts/validate-ux.mjs UX.md\` pass with \`0 errors\`?
`;
}
