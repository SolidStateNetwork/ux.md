#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const jsonMode = args.includes('--json');
const strictMode = args.includes('--strict');
const fileArg = args.find((a) => !a.startsWith('--')) || 'UX.md';
const targetPath = path.resolve(process.cwd(), fileArg);

const findings = [];

function addFinding(rule, severity, message, section = null) {
  findings.push({ rule, severity, ...(section ? { section } : {}), message });
}

if (!fs.existsSync(targetPath)) {
  addFinding('file-not-found', 'error', `UX.md file not found at: ${targetPath}`);
  finish();
}

const raw = fs.readFileSync(targetPath, 'utf8');
const lines = raw.split(/\r?\n/);

const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
const frontmatterText = fmMatch ? fmMatch[1] : '';

const REQUIRED_FM_KEYS = [
  'spec_version',
  'project',
  'platform_profile',
  'archetype',
  'token_source',
  'scroll_owner',
  'breakpoints',
  'shell_budget',
  'z_index_scale',
  'thresholds',
  'layout_primitives'
];

if (!fmMatch) {
  addFinding('missing-frontmatter', 'error', 'Missing YAML frontmatter block at the top of UX.md.');
} else {
  for (const key of REQUIRED_FM_KEYS) {
    const keyRegex = new RegExp(`^${key}\\s*:`, 'm');
    if (!keyRegex.test(frontmatterText)) {
      addFinding('missing-frontmatter', 'error', `Missing required frontmatter key: "${key}".`, 'frontmatter');
    }
  }
}

function extractFmNumber(key) {
  const m = frontmatterText.match(new RegExp(`^\\s*${key}\\s*:\\s*(\\d+)`, 'm'));
  return m ? Number(m[1]) : null;
}

const CANONICAL_SECTIONS = [
  { num: 0, pattern: /^##\s+0\.\s+Product\s*&\s*Domain\s+Topology/i, title: '0. Product & Domain Topology' },
  { num: 1, pattern: /^##\s+1\.\s+Spatial\s+Architecture\s*&\s*App\s+Shell/i, title: '1. Spatial Architecture & App Shell' },
  { num: 2, pattern: /^##\s+2\.\s+Scroll,\s*Viewport\s*&\s*Z-Index\s+Contract/i, title: '2. Scroll, Viewport & Z-Index Contract' },
  { num: 3, pattern: /^##\s+3\.\s+Core\s+Page\s+Archetypes/i, title: '3. Core Page Archetypes (Blueprints)' },
  { num: 4, pattern: /^##\s+4\.\s+Navigation,\s*Route\s+Graph\s*&\s*URL\s+Persistence/i, title: '4. Navigation, Route Graph & URL Persistence' },
  { num: 5, pattern: /^##\s+5\.\s+Overlay\s*&\s*Feedback\s+Decision\s+Matrix/i, title: '5. Overlay & Feedback Decision Matrix' },
  { num: 6, pattern: /^##\s+6\.\s+Mandatory\s+View\s+States/i, title: '6. Mandatory View States (4-State Matrix)' },
  { num: 7, pattern: /^##\s+7\.\s+Mutation,\s*Form\s*&\s*Permission\s+Ergonomics/i, title: '7. Mutation, Form & Permission Ergonomics' },
  { num: 8, pattern: /^##\s+8\.\s+Real-Data\s+Stress,\s*Density\s*&\s*Truncation/i, title: '8. Real-Data Stress, Density & Truncation' },
  { num: 9, pattern: /^##\s+9\.\s+Responsive\s+Reflow\s*&\s*Input\s+Choreography/i, title: '9. Responsive Reflow & Input Choreography' },
  { num: 10, pattern: /^##\s+10\.\s+Mandatory\s+Layout\s+Primitives/i, title: '10. Mandatory Layout Primitives (Code Contract)' },
  { num: 11, pattern: /^##\s+11\.\s+Project\s+Do's,\s*Don'ts\s*&\s*Agent\s+Prompt\s+Guide/i, title: "11. Project Do's, Don'ts & Agent Prompt Guide" }
];

const foundSectionIndices = [];
for (const sec of CANONICAL_SECTIONS) {
  const lineIdx = lines.findIndex((l) => sec.pattern.test(l.trim()));
  if (lineIdx === -1) {
    addFinding('missing-sections', 'error', `Missing required canonical section: "## ${sec.title}"`, `section-${sec.num}`);
  } else {
    foundSectionIndices.push({ num: sec.num, lineIdx });
  }
}

for (let i = 1; i < foundSectionIndices.length; i++) {
  if (foundSectionIndices[i].lineIdx < foundSectionIndices[i - 1].lineIdx) {
    addFinding(
      'section-order',
      'warning',
      `Section ${foundSectionIndices[i].num} appears before Section ${foundSectionIndices[i - 1].num}.`,
      `section-${foundSectionIndices[i].num}`
    );
  }
}

if (fmMatch) {
  const desktopViewport = extractFmNumber('desktop_viewport') ?? 1280;
  const leftNav = extractFmNumber('left_nav_px') ?? 0;
  const rightPanel = extractFmNumber('right_panel_px') ?? 0;
  const outerPadding = extractFmNumber('outer_padding_px') ?? 0;
  const contentMin = extractFmNumber('content_min_px') ?? 0;
  const totalFixedPlusMin = leftNav + rightPanel + outerPadding + contentMin;

  if (totalFixedPlusMin > desktopViewport) {
    const hasCollapse = /collapse_priority\s*:[\s\S]*?below_px\s*:\s*(\d+)/m.exec(frontmatterText);
    const collapsePx = hasCollapse ? Number(hasCollapse[1]) : 0;
    if (!hasCollapse || collapsePx < desktopViewport) {
      addFinding(
        'viewport-overflow',
        'error',
        `Viewport budget overflow: left_nav_px (${leftNav}) + right_panel_px (${rightPanel}) + outer_padding_px (${outerPadding}) + content_min_px (${contentMin}) = ${totalFixedPlusMin}px, exceeding desktop_viewport (${desktopViewport}px) without a collapse_priority >= ${desktopViewport}px.`,
        'frontmatter.shell_budget'
      );
    }
  }
}

if (fmMatch) {
  const zOrder = ['base', 'sticky', 'navigation', 'drawer', 'modal', 'popover', 'toast', 'tooltip'];
  let prevVal = -Infinity;
  let prevKey = null;

  for (const key of zOrder) {
    const val = extractFmNumber(key);
    if (val === null) {
      addFinding('z-index-collision', 'error', `Missing z_index_scale entry for "${key}".`, 'frontmatter.z_index_scale');
    } else {
      if (val <= prevVal) {
        addFinding(
          'z-index-collision',
          'error',
          `Z-index collision or inversion: "${key}" (${val}) must be greater than "${prevKey}" (${prevVal}).`,
          'frontmatter.z_index_scale'
        );
      }
      prevVal = val;
      prevKey = key;
    }
  }
}

function getSectionText(sectionNum) {
  const current = foundSectionIndices.find((s) => s.num === sectionNum);
  if (!current) return '';
  const next = foundSectionIndices.find((s) => s.lineIdx > current.lineIdx);
  const endIdx = next ? next.lineIdx : lines.length;
  return lines.slice(current.lineIdx, endIdx).join('\n');
}

const sec3Text = getSectionText(3);
const sec4Text = getSectionText(4);

const definedArchetypes = new Set();
const archetypeHeadingRegex = /^###\s+Archetype:\s*([A-Za-z0-9_-]+)/gm;
let archMatch;
while ((archMatch = archetypeHeadingRegex.exec(sec3Text)) !== null) {
  definedArchetypes.add(archMatch[1].trim());
}

if (sec3Text && definedArchetypes.size === 0) {
  addFinding(
    'missing-archetypes',
    'error',
    'Section 3 defines no parseable archetypes. Use heading format "### Archetype: <ArchetypeID>".',
    'section-3'
  );
}

const usedArchetypes = new Set();
if (sec4Text) {
  const sec4Lines = sec4Text.split(/\r?\n/);
  let inRouteTable = false;

  for (const line of sec4Lines) {
    const trimmed = line.trim();
    if (/^\|\s*Route\s*\|/i.test(trimmed)) {
      inRouteTable = true;
      continue;
    }
    if (inRouteTable) {
      if (!trimmed.startsWith('|')) {
        inRouteTable = false;
        continue;
      }
      if (/^\|\s*:?---/.test(trimmed)) continue;

      const cells = trimmed
        .split('|')
        .slice(1, -1)
        .map((c) => c.trim().replace(/`/g, ''));

      if (cells.length >= 5) {
        const [route, archetype, entryTrigger, primaryAction, exitFallback] = cells;
        usedArchetypes.add(archetype);

        if (definedArchetypes.size > 0 && !definedArchetypes.has(archetype)) {
          addFinding(
            'broken-route-ref',
            'error',
            `Route "${route}" references unknown Archetype "${archetype}". Defined archetypes: [${Array.from(definedArchetypes).join(', ')}].`,
            'section-4'
          );
        }

        const invalidCell = (val) => !val || /^(tbd|todo|none|n\/a|-|\?)$/i.test(val);
        if (invalidCell(entryTrigger) || invalidCell(primaryAction) || invalidCell(exitFallback)) {
          addFinding(
            'dead-end-flow',
            'error',
            `Route "${route}" has an incomplete reachability contract (Entry: "${entryTrigger}", Primary: "${primaryAction}", Exit: "${exitFallback}").`,
            'section-4'
          );
        }
      }
    }
  }
}

for (const arch of definedArchetypes) {
  if (!usedArchetypes.has(arch)) {
    addFinding(
      'orphaned-archetype',
      'warning',
      `Archetype "${arch}" is defined in Section 3 but not assigned to any route in Section 4.`,
      'section-3'
    );
  }
}

const sec6Text = getSectionText(6);
if (sec6Text) {
  const sec6Lines = sec6Text.split(/\r?\n/);
  let inStateTable = false;
  let stateRows = 0;

  for (const line of sec6Lines) {
    const trimmed = line.trim();
    if (/^\|\s*View/i.test(trimmed) && /Loading/i.test(trimmed) && /Empty/i.test(trimmed) && /Error/i.test(trimmed)) {
      inStateTable = true;
      continue;
    }
    if (inStateTable) {
      if (!trimmed.startsWith('|')) {
        inStateTable = false;
        continue;
      }
      if (/^\|\s*:?---/.test(trimmed)) continue;

      const cells = trimmed
        .split('|')
        .slice(1, -1)
        .map((c) => c.trim());

      if (cells.length >= 5) {
        stateRows++;
        const [viewName, loadingState, emptyState, errorState, populatedState] = cells;
        const missingCell = (c) => !c || /^(tbd|todo|none|n\/a|-)$/i.test(c);
        if (missingCell(loadingState) || missingCell(emptyState) || missingCell(errorState) || missingCell(populatedState)) {
          addFinding(
            'incomplete-state-matrix',
            'error',
            `View "${viewName}" in Section 6 is missing one or more required states (Loading, Empty, Error, Populated).`,
            'section-6'
          );
        }
      }
    }
  }

  if (stateRows === 0) {
    addFinding(
      'incomplete-state-matrix',
      'error',
      'Section 6 contains no valid 4-state matrix rows (View | Loading | Empty | Error | Populated).',
      'section-6'
    );
  }
}

// Avoid matching lowercase query parameters like ?status=todo while catching uppercase TODO/TBD markers.
const PLACEHOLDER_REGEX = /\b(?:TODO|TBD|FIXME)(?::|\b(?=\s+[A-Z]))|\[\s*(?:PROJECT_NAME|APP_SHELL_TYPE|TBD|TODO)\s*\]/;
if (PLACEHOLDER_REGEX.test(raw)) {
  addFinding('vague-prose', 'error', 'Document contains unresolved TODO/TBD/template placeholders.');
}

const VAGUE_PATTERNS = [
  { phrase: 'modals for small forms', regex: /\bmodals?\s+for\s+(?:small|simple)\s+forms\b/i },
  { phrase: 'clean and modern layout', regex: /\b(?:clean|modern|sleek)\s+and\s+(?:modern|clean|intuitive)\s+(?:layout|design|ui)\b/i },
  { phrase: 'show a spinner on slow requests', regex: /\bspinner\s+on\s+slow\s+requests\b/i }
];

for (const vp of VAGUE_PATTERNS) {
  if (vp.regex.test(raw)) {
    addFinding(
      'vague-prose',
      'warning',
      `Ambiguous non-deterministic phrase detected ("${vp.phrase}"). Replace with numeric thresholds (px, ms, field counts).`
    );
  }
}

const siblingDesignMd = path.join(path.dirname(targetPath), 'DESIGN.md');
if (fs.existsSync(siblingDesignMd)) {
  const tokenSourceMatch = frontmatterText.match(/^token_source\s*:\s*["']?([^"'\r\n]+)["']?/m);
  const tokenSource = tokenSourceMatch ? tokenSourceMatch[1].trim() : '';
  if (tokenSource !== 'DESIGN.md') {
    addFinding(
      'design-md-mismatch',
      'warning',
      'Sibling DESIGN.md exists in the directory, but UX.md frontmatter does not declare token_source: "DESIGN.md".',
      'frontmatter.token_source'
    );
  }
}

finish();

function finish() {
  const errors = findings.filter((f) => f.severity === 'error').length;
  const warnings = findings.filter((f) => f.severity === 'warning').length;
  const infos = findings.filter((f) => f.severity === 'info').length;

  if (jsonMode) {
    console.log(
      JSON.stringify(
        {
          file: targetPath,
          findings,
          summary: { errors, warnings, infos },
          valid: errors === 0 && (!strictMode || warnings === 0)
        },
        null,
        2
      )
    );
  } else {
    console.log(`Validating UX.md specification: ${path.relative(process.cwd(), targetPath) || 'UX.md'}\n`);
    for (const f of findings) {
      const prefix = f.severity === 'error' ? '[ERROR]' : f.severity === 'warning' ? '[WARN] ' : '[INFO] ';
      const loc = f.section ? ` [${f.section}]` : '';
      console.log(`${prefix} (${f.rule})${loc}: ${f.message}`);
    }
    if (findings.length > 0) console.log('');
    if (errors > 0 || (strictMode && warnings > 0)) {
      console.error(`FAIL: UX.md validation failed (${errors} error(s), ${warnings} warning(s)).`);
    } else {
      console.log(`PASS: UX.md validation passed (${errors} error(s), ${warnings} warning(s)).`);
    }
  }

  if (errors > 0 || (strictMode && warnings > 0)) {
    process.exit(1);
  }
  process.exit(0);
}
