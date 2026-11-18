#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const outIdx = args.indexOf('--output');
const outputPath = outIdx !== -1 && args[outIdx + 1] ? path.resolve(process.cwd(), args[outIdx + 1]) : null;
const targetDirArg = args.find((a, idx) => !a.startsWith('--') && idx !== (outIdx !== -1 ? outIdx + 1 : -1)) || '.';
const rootDir = path.resolve(process.cwd(), targetDirArg);

function readJsonIfExists(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function readTextIfExists(filePath) {
  if (!fs.existsSync(filePath)) return '';
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return '';
  }
}

const pkg = readJsonIfExists(path.join(rootDir, 'package.json'));
const archMd = readTextIfExists(path.join(rootDir, '.ai', '01-architecture.md'));
const designMd = readTextIfExists(path.join(rootDir, 'DESIGN.md'));

const deps = {
  ...(pkg?.dependencies || {}),
  ...(pkg?.devDependencies || {})
};

let framework = 'unknown';
let platformProfile = 'web-app';

if (deps['react-native'] || deps['expo']) {
  framework = deps['expo'] ? 'expo-react-native' : 'react-native';
  platformProfile = 'mobile-native';
} else if (deps['@tauri-apps/api'] || deps['electron']) {
  framework = deps['@tauri-apps/api'] ? 'tauri' : 'electron';
  platformProfile = 'desktop-app';
} else if (deps['ink'] || deps['blessed']) {
  framework = 'ink-tui';
  platformProfile = 'terminal-tui';
} else if (deps['next']) {
  framework = 'nextjs';
} else if (deps['nuxt'] || deps['vue']) {
  framework = deps['nuxt'] ? 'nuxt' : 'vue';
} else if (deps['@sveltejs/kit'] || deps['svelte']) {
  framework = 'sveltekit';
} else if (deps['react']) {
  framework = 'react-spa';
}

const combinedContext = `${pkg?.name || ''} ${pkg?.description || ''} ${archMd}`.toLowerCase();
let inferredArchetype = 'b2b-saas-workspace';

if (/\b(?:chat|llm|prompt|artifact|assistant|streaming|canvas|ai)\b/.test(combinedContext)) {
  inferredArchetype = 'ai-chat-canvas';
} else if (/\b(?:cart|checkout|storefront|product|shop|catalog|ecommerce)\b/.test(combinedContext)) {
  inferredArchetype = 'ecommerce-storefront';
} else if (/\b(?:telemetry|analytics|metrics|time-series|chart|kpi|observability)\b/.test(combinedContext)) {
  inferredArchetype = 'analytics-dashboard';
} else if (/\b(?:deploy|database|sql|webhook|api-key|workbench|infra|cli)\b/.test(combinedContext)) {
  inferredArchetype = 'developer-tool';
}

const breakpoints = {
  mobile_max: 767,
  tablet_max: 1023,
  desktop_min: 1280
};

if (designMd) {
  const bpNumbers = Array.from(designMd.matchAll(/\b(375|640|767|768|1023|1024|1280|1440)px\b/g)).map((m) => Number(m[1]));
  if (bpNumbers.includes(640) && !bpNumbers.includes(768)) {
    breakpoints.mobile_max = 639;
  }
}

function scanRoutes(baseRoot) {
  const routes = new Set();
  const appDirs = ['src/app', 'app'];
  const pageDirs = ['src/pages', 'pages', 'src/routes'];

  function walkApp(dir, root) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.') || entry.name === 'api' || entry.name === 'node_modules') continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walkApp(full, root);
      } else if (/^(?:page|\+page)\.(?:tsx|jsx|ts|js|vue|svelte)$/.test(entry.name)) {
        const relDir = path.relative(root, dir).split(path.sep).join('/');
        const route =
          '/' +
          relDir
            .split('/')
            .filter((seg) => seg && !/^\(.*\)$/.test(seg) && !seg.startsWith('@'))
            .map((seg) => seg.replace(/^\[(?:\.\.\.)?([^\]]+)\]$/, ':$1'))
            .join('/');
        routes.add(route === '/' ? '/' : route.replace(/\/+$/, ''));
      }
    }
  }

  function walkPages(dir, root) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.') || entry.name.startsWith('_') || entry.name === 'api') continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walkPages(full, root);
      } else if (/\.(?:tsx|jsx|vue|svelte)$/.test(entry.name)) {
        const relFile = path.relative(root, full).split(path.sep).join('/');
        const withoutExt = relFile.replace(/\.(?:tsx|jsx|vue|svelte)$/, '').replace(/(?:^|\/)index$/, '');
        const route =
          '/' +
          withoutExt
            .split('/')
            .filter(Boolean)
            .map((seg) => seg.replace(/^\[(?:\.\.\.)?([^\]]+)\]$/, ':$1'))
            .join('/');
        routes.add(route || '/');
      }
    }
  }

  for (const d of appDirs) walkApp(path.join(baseRoot, d), path.join(baseRoot, d));
  for (const d of pageDirs) walkPages(path.join(baseRoot, d), path.join(baseRoot, d));
  return Array.from(routes).sort();
}

const projectNameFromArch = archMd.match(/-\s+\*\*Project Name:\*\*\s+`?([^`\r\n]+)`?/)?.[1]?.trim();
const resolvedProjectName =
  projectNameFromArch && projectNameFromArch !== '[PROJECT_NAME]'
    ? projectNameFromArch
    : pkg?.name || path.basename(rootDir);

const scanResult = {
  project: resolvedProjectName,
  root_dir: rootDir,
  framework,
  platform_profile: platformProfile,
  inferred_archetype: inferredArchetype,
  has_design_md: Boolean(designMd),
  token_source: designMd ? 'DESIGN.md' : 'standalone',
  breakpoints,
  discovered_routes: scanRoutes(rootDir)
};

const jsonOutput = JSON.stringify(scanResult, null, 2);

if (outputPath) {
  fs.writeFileSync(outputPath, jsonOutput + '\n', 'utf8');
  console.log(`Extracted UX context to: ${path.relative(process.cwd(), outputPath)}`);
} else {
  console.log(jsonOutput);
}
