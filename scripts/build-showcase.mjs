#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const examplesOutDir = path.join(distDir, 'examples');
const previewScript = path.join(rootDir, 'skills', 'ux-md-generator', 'scripts', 'preview-ux.mjs');
const validateScript = path.join(rootDir, 'skills', 'ux-md-generator', 'scripts', 'validate-ux.mjs');

fs.mkdirSync(examplesOutDir, { recursive: true });

const ARCHETYPES = [
  {
    id: 'b2b-saas-workspace',
    title: 'B2B SaaS Workspace',
    summary: 'Keyboard-first issue tracker with 240px left rail, 540px ?inspect= slide-over drawer, and Cmd+K palette.',
    cli: 'npx ux-md init --archetype b2b-saas-workspace --project "LinearFlow Workspace"'
  },
  {
    id: 'ai-chat-canvas',
    title: 'AI Chat & Artifact Canvas',
    summary: 'Split-pane conversational thread with 520px synchronized code/preview artifact stage (?artifact=) and stream lock.',
    cli: 'npx ux-md init --archetype ai-chat-canvas --project "Aether Canvas"'
  },
  {
    id: 'analytics-dashboard',
    title: 'Analytics & Observability',
    summary: 'URL-persisted time and environment filter bar (?from=&to=&env=), CLS=0 chart reservations, and 600px event drawer.',
    cli: 'npx ux-md init --archetype analytics-dashboard --project "PulseWatch Telemetry"'
  },
  {
    id: 'ecommerce-storefront',
    title: 'E-Commerce Storefront',
    summary: 'Faceted catalog grid, 4:5 aspect-reserved product media, 420px slide-over cart drawer (?cart=open), and guest checkout.',
    cli: 'npx ux-md init --archetype ecommerce-storefront --project "Atelier Supply"'
  },
  {
    id: 'developer-tool',
    title: 'Developer Tool & Cloud Console',
    summary: 'Split SQL workbench, 560px streaming build-log drawer (?log=), inline 2000ms copy feedback, and tier-2 slug confirm.',
    cli: 'npx ux-md init --archetype developer-tool --project "ForgeDB Cloud Console"'
  }
];

function extractFmVal(fm, key, fallback = '') {
  const m = fm.match(new RegExp(`^\\s*${key}\\s*:\\s*["']?([^"'\\r\\n]+)["']?`, 'm'));
  return m ? m[1].trim() : fallback;
}

const catalog = [];

for (const item of ARCHETYPES) {
  const uxPath = path.join(rootDir, 'examples', item.id, 'UX.md');
  const htmlOut = path.join(examplesOutDir, `${item.id}.html`);
  const mdOut = path.join(examplesOutDir, `${item.id}-UX.md`);

  execFileSync(process.execPath, [previewScript, uxPath, '--output', htmlOut], { stdio: 'inherit' });
  fs.copyFileSync(uxPath, mdOut);

  const raw = fs.readFileSync(uxPath, 'utf8');
  const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] || '';
  const project = extractFmVal(fm, 'project', item.title);
  const leftNavPx = Number(extractFmVal(fm, 'left_nav_px', '240'));
  const rightPanelPx = Number(extractFmVal(fm, 'right_panel_px', '0'));
  const outerPaddingPx = Number(extractFmVal(fm, 'outer_padding_px', '48'));
  const contentMinPx = Number(extractFmVal(fm, 'content_min_px', '720'));
  const modalMaxFields = Number(extractFmVal(fm, 'modal_max_fields', '4'));
  const scrollOwner = extractFmVal(fm, 'scroll_owner', 'inner-canvas');

  const routeMatches = raw.match(/^\|\s*`\/[^`]*`\s*\|/gm) || [];
  const archetypeMatches = raw.match(/^###\s+Archetype:\s*([A-Za-z0-9_-]+)/gm) || [];

  const lintOut = execFileSync(process.execPath, [validateScript, uxPath, '--strict', '--json'], {
    encoding: 'utf8'
  });
  const lintJson = JSON.parse(lintOut);

  catalog.push({
    ...item,
    project,
    leftNavPx,
    rightPanelPx,
    outerPaddingPx,
    contentMinPx,
    modalMaxFields,
    scrollOwner,
    routeCount: routeMatches.length,
    archetypeCount: archetypeMatches.length,
    lintValid: Boolean(lintJson.valid),
    lintErrors: lintJson.summary?.errors ?? 0,
    lintWarnings: lintJson.summary?.warnings ?? 0
  });
}

if (fs.existsSync(path.join(rootDir, 'llms.txt'))) {
  fs.copyFileSync(path.join(rootDir, 'llms.txt'), path.join(distDir, 'llms.txt'));
}
if (fs.existsSync(path.join(rootDir, 'docs', 'spec.md'))) {
  fs.copyFileSync(path.join(rootDir, 'docs', 'spec.md'), path.join(distDir, 'spec.md'));
}

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const first = catalog[0];

const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>UX.md v1.0 Specification &amp; Interactive Blueprint Showcase</title>
  <style>
    :root {
      --bg-canvas: #0b0f17;
      --bg-surface: #111827;
      --bg-elevated: #0f172a;
      --bg-code: #070a10;
      --border-subtle: #1f2937;
      --border-strong: #334155;
      --text-primary: #f8fafc;
      --text-secondary: #cbd5e1;
      --text-muted: #94a3b8;
      --accent-primary: #38bdf8;
      --accent-bg: #0c2d48;
      --status-pass: #34d399;
      --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Roboto, Helvetica, Arial, sans-serif;
      --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }

    [data-theme="light"] {
      --bg-canvas: #f8fafc;
      --bg-surface: #ffffff;
      --bg-elevated: #f1f5f9;
      --bg-code: #f1f5f9;
      --border-subtle: #e2e8f0;
      --border-strong: #cbd5e1;
      --text-primary: #0f172a;
      --text-secondary: #334155;
      --text-muted: #475569;
      --accent-primary: #0369a1;
      --accent-bg: #e0f2fe;
      --status-pass: #15803d;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    a[href],
    button,
    summary,
    select,
    label[for],
    input[type="checkbox"],
    input[type="radio"],
    [role="button"],
    [role="tab"],
    [role="switch"] {
      cursor: pointer;
    }

    :disabled,
    [aria-disabled="true"] {
      cursor: not-allowed;
      opacity: 0.55;
    }

    body {
      background-color: var(--bg-canvas);
      color: var(--text-primary);
      font-family: var(--font-sans);
      line-height: 1.55;
      padding: 24px 16px 56px;
    }

    .page-shell {
      max-width: 1240px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 40px;
    }

    header.site-header {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      padding-bottom: 18px;
      border-bottom: 1px solid var(--border-strong);
    }

    .brand-lockup {
      display: flex;
      align-items: baseline;
      gap: 12px;
      flex-wrap: wrap;
    }

    .brand-name {
      font-family: var(--font-mono);
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-primary);
      text-decoration: none;
    }

    .brand-tag {
      font-family: var(--font-mono);
      font-size: 0.82rem;
      color: var(--accent-primary);
    }

    nav.top-nav {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 10px;
    }

    nav.top-nav a,
    button.control-btn,
    a.action-link {
      min-height: 44px;
      min-width: 44px;
      padding: 8px 14px;
      border-radius: 6px;
      border: 1px solid var(--border-strong);
      background: var(--bg-surface);
      color: var(--text-secondary);
      font-family: var(--font-mono);
      font-size: 0.82rem;
      font-weight: 600;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: background-color 120ms ease, border-color 120ms ease, transform 80ms ease;
    }

    nav.top-nav a:hover,
    button.control-btn:hover,
    a.action-link:hover {
      background: var(--bg-elevated);
      border-color: var(--accent-primary);
      color: var(--text-primary);
    }

    nav.top-nav a:active,
    button.control-btn:active,
    a.action-link:active {
      transform: translateY(1px);
    }

    a.action-link-primary {
      background: var(--accent-bg);
      border-color: var(--accent-primary);
      color: var(--accent-primary);
    }

    a:focus-visible,
    button:focus-visible {
      outline: 2px solid var(--accent-primary);
      outline-offset: 2px;
    }

    section.hero-split {
      display: grid;
      grid-template-columns: 1.05fr 1.15fr;
      gap: 28px;
      align-items: start;
    }

    .hero-copy {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .hero-copy h1 {
      font-size: clamp(1.75rem, 3.2vw, 2.5rem);
      line-height: 1.18;
      letter-spacing: -0.025em;
      font-weight: 800;
    }

    .hero-copy p {
      color: var(--text-secondary);
      font-size: 1rem;
    }

    .triad-strip {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-top: 4px;
    }

    .triad-cell {
      background: var(--bg-surface);
      border: 1px solid var(--border-strong);
      border-radius: 6px;
      padding: 10px 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .triad-cell-active {
      background: var(--accent-bg);
      border-color: var(--accent-primary);
    }

    .triad-file {
      font-family: var(--font-mono);
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .triad-cell-active .triad-file {
      color: var(--accent-primary);
    }

    .triad-role {
      font-size: 0.78rem;
      color: var(--text-secondary);
    }

    .cmd-box {
      background: var(--bg-code);
      border: 1px solid var(--border-strong);
      border-radius: 8px;
      padding: 12px 14px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }

    .cmd-box code {
      font-family: var(--font-mono);
      font-size: 0.82rem;
      color: var(--accent-primary);
      word-break: break-all;
    }

    .workbench-panel {
      background: var(--bg-surface);
      border: 1px solid var(--border-strong);
      border-radius: 10px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .workbench-header {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
    }

    .workbench-header h2 {
      font-size: 1.05rem;
      font-weight: 700;
    }

    .tab-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    button.arch-tab {
      min-height: 44px;
      padding: 8px 12px;
      border-radius: 6px;
      border: 1px solid var(--border-strong);
      background: var(--bg-canvas);
      color: var(--text-secondary);
      font-family: var(--font-mono);
      font-size: 0.78rem;
      font-weight: 600;
      transition: background-color 120ms ease, border-color 120ms ease, transform 80ms ease;
    }

    button.arch-tab:hover {
      background: var(--bg-elevated);
      border-color: var(--accent-primary);
      color: var(--text-primary);
    }

    button.arch-tab:active {
      transform: translateY(1px);
    }

    button.arch-tab[aria-selected="true"] {
      background: var(--accent-bg);
      border-color: var(--accent-primary);
      color: var(--accent-primary);
      box-shadow: inset 0 0 0 1px var(--accent-primary);
    }

    .spec-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 10px;
    }

    .spec-metric {
      background: var(--bg-canvas);
      border: 1px solid var(--border-subtle);
      border-radius: 6px;
      padding: 10px 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .spec-label {
      font-family: var(--font-mono);
      font-size: 0.74rem;
      color: var(--text-muted);
    }

    .spec-val {
      font-family: var(--font-mono);
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--text-primary);
      font-variant-numeric: tabular-nums;
    }

    .spec-val-pass {
      color: var(--status-pass);
    }

    .workbench-footer {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      padding-top: 8px;
      border-top: 1px solid var(--border-subtle);
    }

    section.directory-section {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .section-head {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: baseline;
      gap: 12px;
    }

    .section-head h2 {
      font-size: clamp(1.2rem, 2.2vw, 1.45rem);
      font-weight: 700;
    }

    .section-head p {
      color: var(--text-secondary);
      font-size: 0.92rem;
    }

    .table-wrap {
      width: 100%;
      overflow-x: auto;
      background: var(--bg-surface);
      border: 1px solid var(--border-strong);
      border-radius: 8px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.88rem;
      text-align: left;
    }

    th, td {
      padding: 12px 14px;
      border-bottom: 1px solid var(--border-subtle);
      vertical-align: middle;
    }

    th {
      font-family: var(--font-mono);
      font-size: 0.76rem;
      color: var(--text-muted);
      background: var(--bg-elevated);
      border-bottom: 1px solid var(--border-strong);
    }

    td.num, th.num {
      text-align: right;
      font-family: var(--font-mono);
      font-variant-numeric: tabular-nums;
    }

    .integration-split {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .panel-box {
      background: var(--bg-surface);
      border: 1px solid var(--border-strong);
      border-radius: 8px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      min-width: 0;
    }

    .panel-box h3 {
      font-size: 1.05rem;
      font-weight: 700;
    }

    .panel-box p {
      font-size: 0.9rem;
      color: var(--text-secondary);
    }

    pre.code-block {
      background: var(--bg-code);
      border: 1px solid var(--border-subtle);
      border-radius: 6px;
      padding: 12px;
      font-family: var(--font-mono);
      font-size: 0.78rem;
      line-height: 1.45;
      color: var(--text-secondary);
      overflow-x: auto;
    }

    footer.site-footer {
      border-top: 1px solid var(--border-strong);
      padding-top: 20px;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    @media (max-width: 960px) {
      section.hero-split,
      .integration-split {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 767px) {
      body {
        padding: 16px 12px 36px;
      }
      .page-shell {
        gap: 28px;
      }
      .triad-strip {
        grid-template-columns: 1fr;
      }
      .workbench-panel,
      .panel-box {
        padding: 14px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      *,
      *::before,
      *::after {
        transition-duration: 0.01ms !important;
        animation-duration: 0.01ms !important;
      }
    }
  </style>
</head>
<body>
  <div class="page-shell">
    <header class="site-header">
      <div class="brand-lockup">
        <a href="./index.html" class="brand-name">UX.md</a>
        <span class="brand-tag">v1.0 structural specification &amp; linter</span>
      </div>
      <nav class="top-nav" aria-label="Primary repository links">
        <a href="#blueprints">5 Reference Blueprints</a>
        <a href="#agent-integration">AGENTS.md &amp; MCP Setup</a>
        <a href="./llms.txt">llms.txt</a>
        <a href="https://github.com/SolidStateNetwork/ux.md">GitHub Repository</a>
        <button type="button" id="theme-toggle" class="control-btn" aria-pressed="false" aria-label="Switch color theme">
          Theme: Dark
        </button>
      </nav>
    </header>

    <main style="display: flex; flex-direction: column; gap: 40px;">
      <section class="hero-split" aria-labelledby="hero-heading">
        <div class="hero-copy">
          <h1 id="hero-heading">Lock down the application skeleton before AI agents write UI code.</h1>
          <p>
            Giving a coding agent <code>DESIGN.md</code> sets your colors, fonts, and border radii. Across multi-session prompts, the interface still drifts structurally: container widths shift, primary actions move, 8-field forms open inside narrow modals, and filter state disappears on <code>F5</code> refresh.
          </p>
          <div class="triad-strip" role="list" aria-label="File standard responsibilities">
            <div class="triad-cell" role="listitem">
              <span class="triad-file">AGENTS.md</span>
              <span class="triad-role">Brain: module boundaries, build and test rules</span>
            </div>
            <div class="triad-cell" role="listitem">
              <span class="triad-file">DESIGN.md</span>
              <span class="triad-role">Skin: color tokens, typography, radii, shadows</span>
            </div>
            <div class="triad-cell triad-cell-active" role="listitem">
              <span class="triad-file">UX.md</span>
              <span class="triad-role">Skeleton: app shell, route graph, 4-state views</span>
            </div>
          </div>
          <div class="cmd-box">
            <code id="install-cmd">npx skills add SolidStateNetwork/ux.md --skill ux-md-generator --copy -y</code>
            <button type="button" class="control-btn" data-copy-target="install-cmd">Copy Skill Install</button>
          </div>
        </div>

        <div class="workbench-panel" aria-labelledby="workbench-title">
          <div class="workbench-header">
            <h2 id="workbench-title">Interactive Archetype Blueprint Inspector</h2>
          </div>
          <div class="tab-row" role="tablist" aria-label="Select reference archetype">
            ${catalog
              .map(
                (c, i) => `<button type="button" role="tab" class="arch-tab" id="tab-${esc(c.id)}" aria-selected="${i === 0 ? 'true' : 'false'}" aria-controls="arch-panel" data-arch-idx="${i}">
              ${esc(c.id)}
            </button>`
              )
              .join('\n')}
          </div>
          <div id="arch-panel" role="tabpanel" aria-labelledby="tab-${esc(first.id)}" style="display: flex; flex-direction: column; gap: 14px;">
            <p id="wb-summary" style="color: var(--text-secondary); font-size: 0.92rem;">${esc(first.summary)}</p>
            <div class="spec-grid">
              <div class="spec-metric">
                <span class="spec-label">Desktop Shell Budget</span>
                <span id="wb-budget" class="spec-val">${first.leftNavPx + first.rightPanelPx + first.outerPaddingPx + first.contentMinPx}px / 1280px</span>
              </div>
              <div class="spec-metric">
                <span class="spec-label">Verified Routes</span>
                <span id="wb-routes" class="spec-val">${first.routeCount} routes (${first.archetypeCount} archetypes)</span>
              </div>
              <div class="spec-metric">
                <span class="spec-label">Overlay Threshold</span>
                <span id="wb-modal" class="spec-val">Modal &lt;= ${first.modalMaxFields} fields</span>
              </div>
              <div class="spec-metric">
                <span class="spec-label">Strict Linter Status</span>
                <span id="wb-linter" class="spec-val spec-val-pass">PASS (${first.lintErrors} errors)</span>
              </div>
            </div>
            <div class="cmd-box">
              <code id="wb-cli">${esc(first.cli)}</code>
              <button type="button" class="control-btn" data-copy-target="wb-cli">Copy Init Command</button>
            </div>
            <div class="workbench-footer">
              <a id="wb-preview-link" class="action-link action-link-primary" href="./examples/${esc(first.id)}.html">
                Open Live Wireframe Simulator (${esc(first.title)})
              </a>
              <a id="wb-raw-link" class="action-link" href="./examples/${esc(first.id)}-UX.md">
                View Raw UX.md Specification
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="blueprints" class="directory-section" aria-labelledby="dir-heading">
        <div class="section-head">
          <h2 id="dir-heading">Validated Reference Blueprints (5 Core Archetypes)</h2>
          <p>Every specification below passes all 12 deterministic rules in <code>validate-ux.mjs --strict</code>.</p>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Archetype ID</th>
                <th>Reference Project</th>
                <th class="num">Left Nav</th>
                <th class="num">Min Canvas</th>
                <th class="num">Routes</th>
                <th>Scroll Owner</th>
                <th>Interactive Wireframe &amp; Source</th>
              </tr>
            </thead>
            <tbody>
              ${catalog
                .map(
                  (c) => `<tr>
                <td style="font-family: var(--font-mono); color: var(--accent-primary); font-weight: 600;">${esc(c.id)}</td>
                <td>${esc(c.project)}</td>
                <td class="num">${c.leftNavPx}px</td>
                <td class="num">${c.contentMinPx}px</td>
                <td class="num">${c.routeCount}</td>
                <td style="font-family: var(--font-mono);">${esc(c.scrollOwner)}</td>
                <td>
                  <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                    <a class="action-link action-link-primary" href="./examples/${esc(c.id)}.html">Open Simulator</a>
                    <a class="action-link" href="./examples/${esc(c.id)}-UX.md">Raw UX.md</a>
                  </div>
                </td>
              </tr>`
                )
                .join('\n')}
            </tbody>
          </table>
        </div>
      </section>

      <section id="agent-integration" class="integration-split" aria-labelledby="int-heading">
        <div class="panel-box">
          <h2 id="int-heading" style="font-size: 1.2rem;">1. Add UX.md to AGENTS.md or CLAUDE.md</h2>
          <p>Paste this contract into your repository's <code>AGENTS.md</code> or <code>CLAUDE.md</code> so coding agents validate layout math and route parity before editing UI components:</p>
          <pre id="agents-snippet" class="code-block">## UI &amp; UX Architecture Contract
- Visual tokens (colors, typography, radii, shadows): see DESIGN.md
- Structural layout (app shell budget, page archetypes, route graph, modal vs. drawer thresholds, 4-state views, and layout primitives): see UX.md
- Validate before committing UI changes: npx ux-md validate UX.md --strict --check-code</pre>
          <div>
            <button type="button" class="control-btn" data-copy-target="agents-snippet">Copy AGENTS.md Snippet</button>
          </div>
        </div>

        <div class="panel-box">
          <h2 style="font-size: 1.2rem;">2. Zero-Dependency MCP Server &amp; GitHub Action</h2>
          <p>Expose <code>ux_extract</code>, <code>ux_generate</code>, <code>ux_validate</code>, <code>ux_preview</code>, and <code>ux_diff</code> to Claude Desktop, Cursor, Windsurf, or OpenCode via Model Context Protocol:</p>
          <pre id="mcp-snippet" class="code-block">{
  "mcpServers": {
    "ux-md": {
      "command": "npx",
      "args": ["-y", "ux-md", "mcp"]
    }
  }
}</pre>
          <div>
            <button type="button" class="control-btn" data-copy-target="mcp-snippet">Copy MCP Configuration</button>
          </div>
        </div>
      </section>
    </main>

    <footer class="site-footer">
      <span>MIT License &copy; SolidStateNetwork</span>
      <div style="display: flex; flex-wrap: wrap; gap: 10px;">
        <a class="action-link" href="https://github.com/SolidStateNetwork/ux.md">GitHub Repository</a>
        <a class="action-link" href="./llms.txt">llms.txt for AI Agents</a>
      </div>
    </footer>
  </div>

  <script>
    const catalogData = ${JSON.stringify(catalog)};
    const tabs = document.querySelectorAll('.arch-tab');
    const panel = document.getElementById('arch-panel');
    const summaryEl = document.getElementById('wb-summary');
    const budgetEl = document.getElementById('wb-budget');
    const routesEl = document.getElementById('wb-routes');
    const modalEl = document.getElementById('wb-modal');
    const linterEl = document.getElementById('wb-linter');
    const cliEl = document.getElementById('wb-cli');
    const previewLink = document.getElementById('wb-preview-link');
    const rawLink = document.getElementById('wb-raw-link');

    function selectArchetype(idx) {
      const item = catalogData[idx];
      if (!item) return;
      tabs.forEach((t, i) => {
        t.setAttribute('aria-selected', String(i === idx));
      });
      panel.setAttribute('aria-labelledby', 'tab-' + item.id);
      summaryEl.textContent = item.summary;
      const totalPx = item.leftNavPx + item.rightPanelPx + item.outerPaddingPx + item.contentMinPx;
      budgetEl.textContent = totalPx + 'px / 1280px';
      routesEl.textContent = item.routeCount + ' routes (' + item.archetypeCount + ' archetypes)';
      modalEl.textContent = 'Modal <= ' + item.modalMaxFields + ' fields';
      linterEl.textContent = (item.lintValid ? 'PASS' : 'FAIL') + ' (' + item.lintErrors + ' errors)';
      cliEl.textContent = item.cli;
      previewLink.setAttribute('href', './examples/' + item.id + '.html');
      previewLink.textContent = 'Open Live Wireframe Simulator (' + item.title + ')';
      rawLink.setAttribute('href', './examples/' + item.id + '-UX.md');
    }

    tabs.forEach((tab, idx) => {
      tab.addEventListener('click', () => selectArchetype(idx));
      tab.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          const next = e.key === 'ArrowRight'
            ? (idx + 1) % catalogData.length
            : (idx - 1 + catalogData.length) % catalogData.length;
          tabs[next].focus();
          selectArchetype(next);
        }
      });
    });

    document.querySelectorAll('[data-copy-target]').forEach((btn) => {
      const originalLabel = btn.textContent;
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-copy-target');
        const targetEl = document.getElementById(targetId);
        if (!targetEl) return;
        const text = targetEl.textContent || '';
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).catch(() => {});
        }
        btn.textContent = 'Copied (2000ms)';
        setTimeout(() => {
          btn.textContent = originalLabel;
        }, 2000);
      });
    });

    const themeBtn = document.getElementById('theme-toggle');
    themeBtn.addEventListener('click', () => {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      if (isLight) {
        document.documentElement.removeAttribute('data-theme');
        themeBtn.setAttribute('aria-pressed', 'false');
        themeBtn.textContent = 'Theme: Dark';
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
        themeBtn.setAttribute('aria-pressed', 'true');
        themeBtn.textContent = 'Theme: Light';
      }
    });
  </script>
</body>
</html>
`;

fs.writeFileSync(path.join(distDir, 'index.html'), indexHtml, 'utf8');
console.log('PASS: Built interactive UX.md showcase in dist/index.html and dist/examples/*.html');
