#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);

function getFlag(name, fallback = null) {
  const idx = args.indexOf(name);
  if (idx !== -1 && args[idx + 1] && !args[idx + 1].startsWith('--')) {
    return args[idx + 1];
  }
  return fallback;
}

const cssOnly = args.includes('--css-only');
const outDirFlag = getFlag('--out-dir', 'src/components/ux');
const positional = args.filter((a, idx) => {
  if (a.startsWith('--')) return false;
  const prev = args[idx - 1];
  if (prev === '--out-dir') return false;
  return true;
});

const uxFileArg = positional[0] || 'UX.md';
const uxPath = path.resolve(process.cwd(), uxFileArg);

if (!fs.existsSync(uxPath)) {
  console.error(`FAIL: UX.md file not found at ${uxPath}`);
  process.exit(1);
}

const raw = fs.readFileSync(uxPath, 'utf8');
const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
if (!fmMatch) {
  console.error('FAIL: UX.md is missing YAML frontmatter block.');
  process.exit(1);
}

const fm = fmMatch[1];

function extractString(key, fallback) {
  const m = fm.match(new RegExp(`^\\s*${key}\\s*:\\s*["']?([^"'\\r\\n]+)["']?`, 'm'));
  return m ? m[1].trim() : fallback;
}

function extractNumber(key, fallback) {
  const m = fm.match(new RegExp(`^\\s*${key}\\s*:\\s*(\\d+)`, 'm'));
  return m ? Number(m[1]) : fallback;
}

const config = {
  project: extractString('project', 'Application'),
  archetype: extractString('archetype', 'b2b-saas-workspace'),
  scrollOwner: extractString('scroll_owner', 'inner-canvas'),
  breakpoints: {
    mobileMax: extractNumber('mobile_max', 767),
    tabletMax: extractNumber('tablet_max', 1023),
    desktopMin: extractNumber('desktop_min', 1280)
  },
  shellBudget: {
    desktopViewport: extractNumber('desktop_viewport', 1280),
    leftNavPx: extractNumber('left_nav_px', 240),
    rightPanelPx: extractNumber('right_panel_px', 0),
    outerPaddingPx: extractNumber('outer_padding_px', 48),
    contentMinPx: extractNumber('content_min_px', 720)
  },
  zIndex: {
    base: extractNumber('base', 0),
    sticky: extractNumber('sticky', 10),
    navigation: extractNumber('navigation', 20),
    drawer: extractNumber('drawer', 30),
    modal: extractNumber('modal', 40),
    popover: extractNumber('popover', 50),
    toast: extractNumber('toast', 60),
    tooltip: extractNumber('tooltip', 70)
  },
  thresholds: {
    modalMaxFields: extractNumber('modal_max_fields', 4),
    noSpinnerBelowMs: extractNumber('no_spinner_below_ms', 150),
    skeletonMinMs: extractNumber('skeleton_min_ms', 150),
    toastAutoDismissMs: extractNumber('toast_auto_dismiss_ms', 4000),
    minTouchTargetPx: extractNumber('min_touch_target_px', 44)
  }
};

const outDir = path.resolve(process.cwd(), outDirFlag);
fs.mkdirSync(outDir, { recursive: true });

const writtenFiles = [];

function writeFile(filename, content) {
  const fullPath = path.join(outDir, filename);
  fs.writeFileSync(fullPath, content, 'utf8');
  writtenFiles.push(path.relative(process.cwd(), fullPath) || filename);
}

const cssContent = `/* Generated from UX.md (${config.project} / ${config.archetype}) */
:root {
  --ux-desktop-viewport: ${config.shellBudget.desktopViewport}px;
  --ux-left-nav-width: ${config.shellBudget.leftNavPx}px;
  --ux-right-panel-width: ${config.shellBudget.rightPanelPx}px;
  --ux-outer-padding: ${config.shellBudget.outerPaddingPx}px;
  --ux-outer-padding-side: ${Math.round(config.shellBudget.outerPaddingPx / 2)}px;
  --ux-content-min-width: ${config.shellBudget.contentMinPx}px;

  --ux-bp-mobile-max: ${config.breakpoints.mobileMax}px;
  --ux-bp-tablet-max: ${config.breakpoints.tabletMax}px;
  --ux-bp-desktop-min: ${config.breakpoints.desktopMin}px;

  --ux-z-base: ${config.zIndex.base};
  --ux-z-sticky: ${config.zIndex.sticky};
  --ux-z-navigation: ${config.zIndex.navigation};
  --ux-z-drawer: ${config.zIndex.drawer};
  --ux-z-modal: ${config.zIndex.modal};
  --ux-z-popover: ${config.zIndex.popover};
  --ux-z-toast: ${config.zIndex.toast};
  --ux-z-tooltip: ${config.zIndex.tooltip};

  --ux-modal-max-fields: ${config.thresholds.modalMaxFields};
  --ux-no-spinner-below-ms: ${config.thresholds.noSpinnerBelowMs}ms;
  --ux-skeleton-min-ms: ${config.thresholds.skeletonMinMs}ms;
  --ux-toast-auto-dismiss-ms: ${config.thresholds.toastAutoDismissMs}ms;
  --ux-min-touch-target: ${config.thresholds.minTouchTargetPx}px;
}

.ux-app-shell {
  display: grid;
  grid-template-columns: var(--ux-left-nav-width) minmax(0, 1fr);
  min-height: 100dvh;
  width: 100%;
  position: relative;
}

.ux-app-shell-nav {
  position: sticky;
  top: 0;
  height: 100dvh;
  width: var(--ux-left-nav-width);
  z-index: var(--ux-z-navigation);
  overflow-y: auto;
}

.ux-app-shell-main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  z-index: var(--ux-z-base);
}

.ux-app-shell-main[data-scroll-owner="inner-canvas"] {
  height: 100dvh;
  overflow-y: auto;
}

.ux-app-shell-drawer {
  position: fixed;
  top: 0;
  right: 0;
  height: 100dvh;
  width: min(540px, 100vw);
  z-index: var(--ux-z-drawer);
  overflow-y: auto;
}

.ux-page-header {
  position: sticky;
  top: 0;
  z-index: var(--ux-z-sticky);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 48px;
  padding: 12px var(--ux-outer-padding-side);
}

.ux-page-header-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.ux-page-section {
  width: 100%;
  margin: 0 auto;
  padding: 20px var(--ux-outer-padding-side);
}

.ux-page-section[data-archetype="list-index"],
.ux-page-section[data-archetype="workspace-detail"] {
  max-width: var(--ux-desktop-viewport);
}

.ux-page-section[data-archetype="focused-form"] {
  max-width: 640px;
}

.ux-page-section[data-archetype="full-bleed"] {
  max-width: 100%;
}

.ux-touch-target {
  min-height: var(--ux-min-touch-target);
  min-width: var(--ux-min-touch-target);
  cursor: pointer;
}

.ux-tabular-nums {
  font-variant-numeric: tabular-nums;
}

@media (max-width: ${config.breakpoints.tabletMax}px) {
  .ux-app-shell {
    grid-template-columns: minmax(0, 1fr);
  }
  .ux-app-shell-nav {
    display: none;
  }
  .ux-app-shell-nav[data-mobile-open="true"] {
    display: block;
    position: fixed;
    left: 0;
    top: 0;
    width: min(260px, 85vw);
    z-index: var(--ux-z-drawer);
  }
}

@media (max-width: ${config.breakpoints.mobileMax}px) {
  .ux-app-shell-main {
    padding-bottom: calc(56px + env(safe-area-inset-bottom, 0px));
  }
}

@media (prefers-reduced-motion: reduce) {
  .ux-app-shell *,
  .ux-page-header *,
  .ux-page-section * {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
`;

writeFile('ux-contract.css', cssContent);

if (!cssOnly) {
  const appShellTsx = `import React, { useEffect, useState } from 'react';

export interface AppShellNavItem {
  id: string;
  label: string;
  href: string;
}

export interface AppShellProps {
  activeNavId: string;
  navItems?: AppShellNavItem[];
  inspector?: React.ReactNode;
  onCloseInspector?: () => void;
  banner?: React.ReactNode;
  children: React.ReactNode;
}

export function AppShell({
  activeNavId,
  navItems = [],
  inspector,
  onCloseInspector,
  banner,
  children
}: AppShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        if (inspector && onCloseInspector) {
          onCloseInspector();
        } else if (mobileNavOpen) {
          setMobileNavOpen(false);
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inspector, onCloseInspector, mobileNavOpen]);

  return (
    <div className="ux-app-shell" data-archetype="${config.archetype}">
      <aside
        className="ux-app-shell-nav"
        data-mobile-open={mobileNavOpen ? 'true' : 'false'}
        aria-label="Primary navigation"
      >
        <nav>
          <ul>
            {navItems.map((item) => (
              <li key={item.id}>
                <a
                  href={item.href}
                  className="ux-touch-target"
                  aria-current={item.id === activeNavId ? 'page' : undefined}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="ux-app-shell-main" data-scroll-owner="${config.scrollOwner}">
        {banner ? <div role="region" aria-label="System status banner">{banner}</div> : null}
        <main>{children}</main>
      </div>

      {inspector ? (
        <aside
          className="ux-app-shell-drawer"
          role="dialog"
          aria-modal="false"
          aria-label="Detail inspector"
        >
          {inspector}
        </aside>
      ) : null}
    </div>
  );
}
`;

  const pageHeaderTsx = `import React from 'react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  badge?: React.ReactNode;
  primaryAction?: React.ReactNode;
  secondaryActions?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  badge,
  primaryAction,
  secondaryActions
}: PageHeaderProps) {
  return (
    <header className="ux-page-header">
      <div style={{ minWidth: 0 }}>
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <nav aria-label="Breadcrumb">
            <ol style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', listStyle: 'none', padding: 0, margin: 0 }}>
              {breadcrumbs.map((crumb, idx) => (
                <li key={crumb.label}>
                  {crumb.href ? <a href={crumb.href}>{crumb.label}</a> : <span>{crumb.label}</span>}
                  {idx < breadcrumbs.length - 1 ? <span aria-hidden="true"> / </span> : null}
                </li>
              ))}
            </ol>
          </nav>
        ) : null}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <h1 style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{title}</h1>
          {badge}
        </div>
        {description ? <p style={{ margin: '4px 0 0' }}>{description}</p> : null}
      </div>

      {secondaryActions || primaryAction ? (
        <div className="ux-page-header-actions">
          {secondaryActions}
          {primaryAction}
        </div>
      ) : null}
    </header>
  );
}
`;

  const pageSectionTsx = `import React from 'react';

export type PageArchetypeId = 'list-index' | 'workspace-detail' | 'focused-form' | 'full-bleed';

export interface PageSectionProps {
  archetype: PageArchetypeId;
  toolbar?: React.ReactNode;
  children: React.ReactNode;
}

export function PageSection({ archetype, toolbar, children }: PageSectionProps) {
  return (
    <section className="ux-page-section" data-archetype={archetype}>
      {toolbar ? <div className="ux-page-section-toolbar">{toolbar}</div> : null}
      {children}
    </section>
  );
}
`;

  const dataStateBoundaryTsx = `import React, { useEffect, useState } from 'react';

export interface EmptyStateConfig {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export interface ErrorStateConfig {
  message: string;
  onRetry: () => void;
}

export interface DataStateBoundaryProps<T> {
  status: 'loading' | 'error' | 'success';
  data: T | null | undefined;
  isEmpty: (data: T) => boolean;
  skeleton: React.ReactNode;
  emptyState: EmptyStateConfig;
  errorState: ErrorStateConfig;
  noSpinnerBelowMs?: number;
  children: (data: T) => React.ReactNode;
}

export function DataStateBoundary<T>({
  status,
  data,
  isEmpty,
  skeleton,
  emptyState,
  errorState,
  noSpinnerBelowMs = ${config.thresholds.noSpinnerBelowMs},
  children
}: DataStateBoundaryProps<T>) {
  const [showSkeleton, setShowSkeleton] = useState(noSpinnerBelowMs === 0);

  useEffect(() => {
    if (status !== 'loading') {
      setShowSkeleton(false);
      return;
    }
    const timer = window.setTimeout(() => {
      setShowSkeleton(true);
    }, noSpinnerBelowMs);
    return () => window.clearTimeout(timer);
  }, [status, noSpinnerBelowMs]);

  if (status === 'loading') {
    return (
      <div aria-busy="true" aria-live="polite">
        {showSkeleton ? skeleton : null}
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div role="alert" style={{ padding: '16px' }}>
        <p>{errorState.message}</p>
        <button type="button" className="ux-touch-target" onClick={errorState.onRetry}>
          Retry
        </button>
      </div>
    );
  }

  if (data === null || data === undefined || isEmpty(data)) {
    return (
      <div role="status" style={{ maxWidth: '420px', margin: '0 auto', padding: '24px 16px', textAlign: 'center' }}>
        <h2>{emptyState.title}</h2>
        <p>{emptyState.description}</p>
        {emptyState.actionLabel && emptyState.onAction ? (
          <button type="button" className="ux-touch-target" onClick={emptyState.onAction}>
            {emptyState.actionLabel}
          </button>
        ) : null}
      </div>
    );
  }

  return <>{children(data)}</>;
}

export function formatCellFallback(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') {
    return '-';
  }
  return String(value);
}
`;

  const indexTs = `export { AppShell, type AppShellNavItem, type AppShellProps } from './AppShell';
export { PageHeader, type BreadcrumbItem, type PageHeaderProps } from './PageHeader';
export { PageSection, type PageArchetypeId, type PageSectionProps } from './PageSection';
export {
  DataStateBoundary,
  formatCellFallback,
  type DataStateBoundaryProps,
  type EmptyStateConfig,
  type ErrorStateConfig
} from './DataStateBoundary';
`;

  writeFile('AppShell.tsx', appShellTsx);
  writeFile('PageHeader.tsx', pageHeaderTsx);
  writeFile('PageSection.tsx', pageSectionTsx);
  writeFile('DataStateBoundary.tsx', dataStateBoundaryTsx);
  writeFile('index.ts', indexTs);
}

console.log(
  `PASS: Scaffolded ${writtenFiles.length} UX.md layout primitive file(s) into ${path.relative(process.cwd(), outDir) || outDirFlag}:`
);
for (const file of writtenFiles) {
  console.log(`  - ${file}`);
}
