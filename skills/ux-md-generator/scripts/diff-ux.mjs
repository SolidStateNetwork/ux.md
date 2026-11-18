#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const jsonMode = args.includes('--json');
const positional = args.filter((a) => !a.startsWith('--'));

if (positional.length < 2) {
  console.error('Usage: node diff-ux.mjs <before-UX.md> <after-UX.md> [--json]');
  process.exit(1);
}

const beforePath = path.resolve(process.cwd(), positional[0]);
const afterPath = path.resolve(process.cwd(), positional[1]);

if (!fs.existsSync(beforePath) || !fs.existsSync(afterPath)) {
  console.error('FAIL: Both before and after UX.md files must exist.');
  process.exit(1);
}

function parseUxSnapshot(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] || '';
  const getNum = (k) => {
    const m = fm.match(new RegExp(`^\\s*${k}\\s*:\\s*(\\d+)`, 'm'));
    return m ? Number(m[1]) : null;
  };
  const getStr = (k) => {
    const m = fm.match(new RegExp(`^\\s*${k}\\s*:\\s*["']?([^"'\\r\\n]+)["']?`, 'm'));
    return m ? m[1].trim() : null;
  };

  const archetypes = [];
  const archRegex = /^###\s+Archetype:\s*([A-Za-z0-9_-]+)/gm;
  let am;
  while ((am = archRegex.exec(raw)) !== null) {
    archetypes.push(am[1].trim());
  }

  const routes = [];
  const lines = raw.split(/\r?\n/);
  let inRouteTable = false;
  for (const line of lines) {
    const t = line.trim();
    if (/^\|\s*Route\s*\|/i.test(t)) {
      inRouteTable = true;
      continue;
    }
    if (inRouteTable) {
      if (!t.startsWith('|')) {
        inRouteTable = false;
        continue;
      }
      if (/^\|\s*:?---/.test(t)) continue;
      const cells = t
        .split('|')
        .slice(1, -1)
        .map((c) => c.trim().replace(/`/g, ''));
      if (cells[0]) routes.push(cells[0]);
    }
  }

  return {
    archetype: getStr('archetype'),
    scroll_owner: getStr('scroll_owner'),
    budget: {
      desktop_viewport: getNum('desktop_viewport'),
      left_nav_px: getNum('left_nav_px'),
      right_panel_px: getNum('right_panel_px'),
      content_min_px: getNum('content_min_px')
    },
    thresholds: {
      modal_max_fields: getNum('modal_max_fields'),
      no_spinner_below_ms: getNum('no_spinner_below_ms'),
      toast_auto_dismiss_ms: getNum('toast_auto_dismiss_ms'),
      min_touch_target_px: getNum('min_touch_target_px')
    },
    archetypes,
    routes
  };
}

const before = parseUxSnapshot(beforePath);
const after = parseUxSnapshot(afterPath);

const addedRoutes = after.routes.filter((r) => !before.routes.includes(r));
const removedRoutes = before.routes.filter((r) => !after.routes.includes(r));
const addedArchetypes = after.archetypes.filter((a) => !before.archetypes.includes(a));
const removedArchetypes = before.archetypes.filter((a) => !after.archetypes.includes(a));

const budgetChanges = [];
for (const k of Object.keys(before.budget)) {
  if (before.budget[k] !== after.budget[k]) {
    budgetChanges.push({ key: k, before: before.budget[k], after: after.budget[k] });
  }
}

const thresholdChanges = [];
for (const k of Object.keys(before.thresholds)) {
  if (before.thresholds[k] !== after.thresholds[k]) {
    thresholdChanges.push({ key: k, before: before.thresholds[k], after: after.thresholds[k] });
  }
}

const diffResult = {
  routes: { added: addedRoutes, removed: removedRoutes },
  archetypes: { added: addedArchetypes, removed: removedArchetypes },
  budget_changes: budgetChanges,
  threshold_changes: thresholdChanges,
  breaking_regression: removedRoutes.length > 0 || removedArchetypes.length > 0
};

if (jsonMode) {
  console.log(JSON.stringify(diffResult, null, 2));
} else {
  console.log(`UX.md Structural Diff: ${path.basename(beforePath)} -> ${path.basename(afterPath)}`);
  console.log(`Routes added (${addedRoutes.length}): ${addedRoutes.join(', ') || 'none'}`);
  console.log(`Routes removed (${removedRoutes.length}): ${removedRoutes.join(', ') || 'none'}`);
  console.log(`Archetypes added (${addedArchetypes.length}): ${addedArchetypes.join(', ') || 'none'}`);
  console.log(`Archetypes removed (${removedArchetypes.length}): ${removedArchetypes.join(', ') || 'none'}`);
  console.log(`Budget changes: ${budgetChanges.length}`);
  console.log(`Threshold changes: ${thresholdChanges.length}`);
}
