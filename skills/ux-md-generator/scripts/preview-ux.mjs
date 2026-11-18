#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
const outIdx = args.indexOf('--output');
const outputPath =
  outIdx !== -1 && args[outIdx + 1]
    ? path.resolve(process.cwd(), args[outIdx + 1])
    : path.resolve(process.cwd(), 'ux-preview.html');

const inputArg = args.find((a, idx) => !a.startsWith('--') && idx !== (outIdx !== -1 ? outIdx + 1 : -1)) || 'UX.md';
const inputPath = path.resolve(process.cwd(), inputArg);

if (!fs.existsSync(inputPath)) {
  console.error(`FAIL: UX.md file not found at ${inputPath}`);
  process.exit(1);
}

const raw = fs.readFileSync(inputPath, 'utf8');
const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
const fm = fmMatch ? fmMatch[1] : '';

function getFmStr(key, fallback = '-') {
  const m = fm.match(new RegExp(`^\\s*${key}\\s*:\\s*["']?([^"'\\r\\n]+)["']?`, 'm'));
  return m ? m[1].trim() : fallback;
}

function getFmNum(key, fallback = 0) {
  const m = fm.match(new RegExp(`^\\s*${key}\\s*:\\s*(\\d+)`, 'm'));
  return m ? Number(m[1]) : fallback;
}

const project = getFmStr('project', 'UX.md Specification');
const platformProfile = getFmStr('platform_profile', 'web-app');
const archetype = getFmStr('archetype', 'b2b-saas-workspace');
const tokenSource = getFmStr('token_source', 'DESIGN.md');
const scrollOwner = getFmStr('scroll_owner', 'inner-canvas');

const desktopViewport = getFmNum('desktop_viewport', 1280);
const leftNavPx = getFmNum('left_nav_px', 240);
const rightPanelPx = getFmNum('right_panel_px', 0);
const outerPaddingPx = getFmNum('outer_padding_px', 48);
const contentMinPx = getFmNum('content_min_px', 720);

const modalMaxFields = getFmNum('modal_max_fields', 4);
const noSpinnerMs = getFmNum('no_spinner_below_ms', 150);
const toastMs = getFmNum('toast_auto_dismiss_ms', 4000);
const minTouchPx = getFmNum('min_touch_target_px', 44);

const zKeys = ['base', 'sticky', 'navigation', 'drawer', 'modal', 'popover', 'toast', 'tooltip'];
const zLayers = zKeys.map((k) => ({ key: k, value: getFmNum(k, 0) }));

const archetypes = [];
const archRegex = /^###\s+Archetype:\s*([A-Za-z0-9_-]+)([\s\S]*?)(?=^###\s+Archetype:|^##\s+\d+\.|\Z)/gm;
let am;
while ((am = archRegex.exec(raw)) !== null) {
  const id = am[1].trim();
  const body = am[2];
  const purpose = body.match(/-\s+\*\*Purpose[^*]*\*\*\s*([^\r\n]+)/i)?.[1]?.trim() || '';
  const cta = body.match(/-\s+\*\*Primary CTA[^*]*\*\*\s*([^\r\n]+)/i)?.[1]?.trim() || '';
  const ascii = body.match(/```text\r?\n([\s\S]*?)```/)?.[1]?.trim() || '';
  archetypes.push({ id, purpose, cta, ascii });
}

function parseMarkdownTable(sectionHeadingRegex, headerMatchRegex) {
  const secMatch = raw.match(sectionHeadingRegex);
  if (!secMatch) return [];
  const startIdx = secMatch.index;
  const rest = raw.slice(startIdx);
  const nextSec = rest.slice(5).search(/^##\s+\d+\./m);
  const block = nextSec !== -1 ? rest.slice(0, nextSec + 5) : rest;
  const blockLines = block.split(/\r?\n/);

  const rows = [];
  let active = false;
  for (const line of blockLines) {
    const t = line.trim();
    if (headerMatchRegex.test(t)) {
      active = true;
      continue;
    }
    if (active) {
      if (!t.startsWith('|')) {
        active = false;
        continue;
      }
      if (/^\|\s*:?---/.test(t)) continue;
      const cells = t
        .split('|')
        .slice(1, -1)
        .map((c) => c.trim().replace(/`/g, ''));
      rows.push(cells);
    }
  }
  return rows;
}

const routeRows = parseMarkdownTable(/^##\s+4\./m, /^\|\s*Route\s*\|/i);
const stateRows = parseMarkdownTable(/^##\s+6\./m, /^\|\s*View/i);

let lintReport = { valid: true, summary: { errors: 0, warnings: 0 }, findings: [] };
try {
  const validatorPath = path.join(__dirname, 'validate-ux.mjs');
  const stdout = execFileSync(process.execPath, [validatorPath, inputPath, '--json'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore']
  });
  lintReport = JSON.parse(stdout);
} catch (err) {
  if (err.stdout) {
    try {
      lintReport = JSON.parse(err.stdout);
    } catch {
      lintReport = { valid: false, summary: { errors: 1, warnings: 0 }, findings: [] };
    }
  }
}

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>UX.md Blueprint Preview: ${esc(project)}</title>
  <style>
    :root {
      --bg-canvas: #0b0f17;
      --bg-surface: #111827;
      --bg-elevated: #1e293b;
      --border-subtle: #1f2937;
      --border-strong: #334155;
      --text-primary: #f8fafc;
      --text-secondary: #cbd5e1;
      --text-muted: #94a3b8;
      --accent-primary: #38bdf8;
      --accent-bg: #0c2d48;
      --status-pass: #34d399;
      --status-warn: #fbbf24;
      --status-fail: #f87171;
      --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Roboto, Helvetica, Arial, sans-serif;
      --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--bg-canvas);
      color: var(--text-primary);
      font-family: var(--font-sans);
      line-height: 1.5;
      padding: 24px 16px 64px;
    }

    .container {
      max-width: 1280px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    header.top-header {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--border-strong);
    }

    .title-group h1 {
      font-size: 1.75rem;
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    .meta-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
    }

    .pill {
      font-family: var(--font-mono);
      font-size: 0.78rem;
      padding: 4px 10px;
      border-radius: 6px;
      background: var(--bg-surface);
      border: 1px solid var(--border-strong);
      color: var(--text-secondary);
      font-variant-numeric: tabular-nums;
    }

    .pill-pass {
      border-color: var(--status-pass);
      color: var(--status-pass);
    }

    .pill-fail {
      border-color: var(--status-fail);
      color: var(--status-fail);
    }

    section.card {
      background: var(--bg-surface);
      border: 1px solid var(--border-strong);
      border-radius: 8px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 0;
    }

    section.card h2 {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }

    .bp-controls {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    button.bp-btn {
      min-height: 44px;
      min-width: 44px;
      padding: 8px 14px;
      border-radius: 6px;
      border: 1px solid var(--border-strong);
      background: var(--bg-canvas);
      color: var(--text-secondary);
      font-family: var(--font-mono);
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      font-variant-numeric: tabular-nums;
    }

    button.bp-btn[aria-pressed="true"] {
      background: var(--accent-bg);
      border-color: var(--accent-primary);
      color: var(--accent-primary);
    }

    button.bp-btn:focus-visible {
      outline: 2px solid var(--accent-primary);
      outline-offset: 2px;
    }

    .shell-stage-wrapper {
      background: var(--bg-canvas);
      border: 1px solid var(--border-subtle);
      border-radius: 6px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      overflow-x: auto;
    }

    .shell-Readout {
      font-family: var(--font-mono);
      font-size: 0.82rem;
      color: var(--accent-primary);
      font-variant-numeric: tabular-nums;
    }

    .shell-wireframe {
      width: 100%;
      max-width: 100%;
      min-height: 220px;
      border: 1.5px solid var(--border-strong);
      border-radius: 6px;
      display: grid;
      grid-template-columns: 200px 1fr;
      background: #090d16;
    }

    .shell-wireframe[data-bp="tablet"],
    .shell-wireframe[data-bp="mobile"] {
      grid-template-columns: 1fr;
    }

    .shell-nav {
      border-right: 1px solid var(--border-strong);
      padding: 14px;
      background: #0f172a;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      font-family: var(--font-mono);
      font-size: 0.8rem;
    }

    .shell-wireframe[data-bp="tablet"] .shell-nav,
    .shell-wireframe[data-bp="mobile"] .shell-nav {
      border-right: none;
      border-bottom: 1px solid var(--border-strong);
      flex-direction: row;
      align-items: center;
    }

    .shell-main {
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      min-width: 0;
    }

    .shell-header-box {
      border: 1px solid var(--border-strong);
      border-radius: 4px;
      padding: 10px 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--bg-surface);
      font-family: var(--font-mono);
      font-size: 0.8rem;
    }

    .shell-content-box {
      flex: 1;
      border: 1px dashed var(--accent-primary);
      border-radius: 4px;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-family: var(--font-mono);
      font-size: 0.8rem;
      color: var(--text-secondary);
    }

    .grid-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
    }

    .arch-card {
      background: var(--bg-canvas);
      border: 1px solid var(--border-strong);
      border-radius: 6px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      min-width: 0;
    }

    .arch-card h3 {
      font-family: var(--font-mono);
      font-size: 0.95rem;
      color: var(--accent-primary);
    }

    .arch-card p {
      font-size: 0.86rem;
      color: var(--text-secondary);
    }

    pre.ascii-box {
      background: #070a10;
      border: 1px solid var(--border-subtle);
      border-radius: 4px;
      padding: 10px;
      font-family: var(--font-mono);
      font-size: 0.72rem;
      line-height: 1.35;
      color: var(--text-secondary);
      overflow-x: auto;
    }

    .table-wrap {
      width: 100%;
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.85rem;
      text-align: left;
    }

    th, td {
      padding: 10px 12px;
      border-bottom: 1px solid var(--border-subtle);
      vertical-align: top;
    }

    th {
      font-family: var(--font-mono);
      font-size: 0.76rem;
      color: var(--text-muted);
      background: var(--bg-canvas);
      border-bottom: 1px solid var(--border-strong);
    }

    td.num, th.num {
      text-align: right;
      font-family: var(--font-mono);
      font-variant-numeric: tabular-nums;
    }

    .z-stack {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
      gap: 10px;
    }

    .z-item {
      background: var(--bg-canvas);
      border: 1px solid var(--border-strong);
      border-radius: 6px;
      padding: 10px 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: var(--font-mono);
      font-size: 0.82rem;
      font-variant-numeric: tabular-nums;
    }

    .z-val {
      color: var(--accent-primary);
      font-weight: 700;
    }
  </style>
</head>
<body>
  <div class="container">
    <header class="top-header">
      <div class="title-group">
        <h1>${esc(project)}</h1>
        <div class="meta-pills">
          <span class="pill">profile: ${esc(platformProfile)}</span>
          <span class="pill">archetype: ${esc(archetype)}</span>
          <span class="pill">scroll: ${esc(scrollOwner)}</span>
          <span class="pill">tokens: ${esc(tokenSource)}</span>
          <span class="pill">modal &lt;= ${modalMaxFields} fields</span>
          <span class="pill">skeleton &gt;= ${noSpinnerMs}ms</span>
          <span class="pill">touch &gt;= ${minTouchPx}px</span>
        </div>
      </div>
      <div>
        <span class="pill ${lintReport.valid ? 'pill-pass' : 'pill-fail'}">
          Linter: ${lintReport.valid ? 'PASS' : 'FAIL'} (${lintReport.summary.errors} errors, ${lintReport.summary.warnings} warnings)
        </span>
      </div>
    </header>

    <main style="display: flex; flex-direction: column; gap: 28px;">
      <section class="card" aria-labelledby="shell-heading">
        <h2 id="shell-heading">
          <span>1. Interactive App Shell &amp; Viewport Budget Simulator</span>
          <div class="bp-controls" role="group" aria-label="Viewport breakpoint switcher">
            <button type="button" class="bp-btn" data-target="desktop" aria-pressed="true">Desktop (${desktopViewport}px)</button>
            <button type="button" class="bp-btn" data-target="tablet" aria-pressed="false">Tablet (768px)</button>
            <button type="button" class="bp-btn" data-target="mobile" aria-pressed="false">Mobile (375px)</button>
          </div>
        </h2>
        <div class="shell-stage-wrapper">
          <div id="shell-readout" class="shell-Readout">
            Desktop Budget (${desktopViewport}px): Left Nav ${leftNavPx}px + Right Panel ${rightPanelPx}px + Outer Padding ${outerPaddingPx}px + Min Content ${contentMinPx}px = ${leftNavPx + rightPanelPx + outerPaddingPx + contentMinPx}px
          </div>
          <div id="shell-frame" class="shell-wireframe" data-bp="desktop">
            <nav class="shell-nav" aria-label="Simulated app navigation">
              <strong id="nav-label">Navigation (${leftNavPx}px)</strong>
              <span>z-index: 20</span>
            </nav>
            <div class="shell-main">
              <div class="shell-header-box">
                <span>&lt;PageHeader&gt; (sticky z-10)</span>
                <span>[Primary CTA]</span>
              </div>
              <div class="shell-content-box">
                <strong>&lt;PageSection&gt; + &lt;DataStateBoundary&gt;</strong>
                <span>scroll_owner: ${esc(scrollOwner)} | CLS = 0 reservation</span>
                <span>4 mandatory states: Loading (Skeleton) | Empty (CTA) | Error (In-place Retry) | Populated</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="card" aria-labelledby="arch-heading">
        <h2 id="arch-heading">2. Core Page Archetypes (${archetypes.length})</h2>
        <div class="grid-cards">
          ${archetypes
            .map(
              (a) => `<article class="arch-card">
            <h3>Archetype: ${esc(a.id)}</h3>
            <p>${esc(a.purpose)}</p>
            <p><strong>Primary CTA:</strong> ${esc(a.cta)}</p>
            ${a.ascii ? `<pre class="ascii-box">${esc(a.ascii)}</pre>` : ''}
          </article>`
            )
            .join('\n')}
        </div>
      </section>

      <section class="card" aria-labelledby="routes-heading">
        <h2 id="routes-heading">3. Route Reachability Graph (${routeRows.length} Routes)</h2>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Route</th>
                <th>Archetype</th>
                <th>Entry Trigger</th>
                <th>Primary Action</th>
                <th>Exit / Cancel Fallback</th>
              </tr>
            </thead>
            <tbody>
              ${routeRows
                .map(
                  (r) => `<tr>
                <td style="font-family: var(--font-mono); color: var(--accent-primary);">${esc(r[0] || '')}</td>
                <td style="font-family: var(--font-mono);">${esc(r[1] || '')}</td>
                <td>${esc(r[2] || '')}</td>
                <td>${esc(r[3] || '')}</td>
                <td>${esc(r[4] || '')}</td>
              </tr>`
                )
                .join('\n')}
            </tbody>
          </table>
        </div>
      </section>

      <section class="card" aria-labelledby="states-heading">
        <h2 id="states-heading">4. Mandatory 4-State View Matrix</h2>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>View / Component</th>
                <th>Loading (Skeleton)</th>
                <th>Empty (Copy + CTA)</th>
                <th>Error (In-Place Retry)</th>
                <th>Populated (Density &amp; Overflow)</th>
              </tr>
            </thead>
            <tbody>
              ${stateRows
                .map(
                  (r) => `<tr>
                <td style="font-family: var(--font-mono);">${esc(r[0] || '')}</td>
                <td>${esc(r[1] || '')}</td>
                <td>${esc(r[2] || '')}</td>
                <td>${esc(r[3] || '')}</td>
                <td>${esc(r[4] || '')}</td>
              </tr>`
                )
                .join('\n')}
            </tbody>
          </table>
        </div>
      </section>

      <section class="card" aria-labelledby="z-heading">
        <h2 id="z-heading">5. Monotonic Z-Index Elevation Contract</h2>
        <div class="z-stack">
          ${zLayers
            .map(
              (z) => `<div class="z-item">
            <span>${esc(z.key)}</span>
            <span class="z-val">${z.value}</span>
          </div>`
            )
            .join('\n')}
        </div>
      </section>
    </main>
  </div>

  <script>
    const buttons = document.querySelectorAll('.bp-btn');
    const frame = document.getElementById('shell-frame');
    const readout = document.getElementById('shell-readout');
    const navLabel = document.getElementById('nav-label');

    const descriptions = {
      desktop: 'Desktop Budget (${desktopViewport}px): Left Nav ${leftNavPx}px + Right Panel ${rightPanelPx}px + Outer Padding ${outerPaddingPx}px + Min Content ${contentMinPx}px = ${leftNavPx + rightPanelPx + outerPaddingPx + contentMinPx}px',
      tablet: 'Tablet Budget (768px): Left Nav collapsed into 260px off-canvas Sheet (Menu trigger); Full-width main canvas',
      mobile: 'Mobile Budget (375px): Bottom Bar (56px + safe-area reserved); Tables collapse to stacked 3-field cards; Touch targets >= ${minTouchPx}px'
    };

    const navLabels = {
      desktop: 'Navigation (${leftNavPx}px)',
      tablet: '[Menu] Top / Sheet Nav',
      mobile: 'Bottom Bar (56px + safe-area)'
    };

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-target');
        buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
        frame.setAttribute('data-bp', target);
        readout.textContent = descriptions[target];
        navLabel.textContent = navLabels[target];
      });
    });
  </script>
</body>
</html>
`;

fs.writeFileSync(outputPath, html, 'utf8');
console.log(`PASS: Generated interactive UX blueprint preview at ${path.relative(process.cwd(), outputPath)}`);
