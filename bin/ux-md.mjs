#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const scriptsDir = path.join(rootDir, 'skills', 'ux-md-generator', 'scripts');

const args = process.argv.slice(2);
const command = args[0];
const subArgs = args.slice(1);

function printHelp() {
  console.log(`ux-md v1.0.0 - Structural UI/UX specification CLI & MCP server

Usage:
  npx ux-md <command> [options]

Commands:
  init        Scan the current directory (or use --archetype / --preset) and generate UX.md
  extract     Scan package.json, AGENTS.md, DESIGN.md, and source routes into JSON
  generate    Generate a 12-section UX.md from an archetype, product preset, or scan file
  validate    Validate UX.md against 16 structural & code-contract linter rules (--strict --check-code)
  scaffold    Generate CSS contract variables + React/TypeScript layout primitives from UX.md
  preview     Render an interactive HTML wireframe and breakpoint simulator (1280px / 768px / 375px)
  diff        Compare two UX.md versions for route, archetype, budget, or threshold regressions
  mcp         Start the zero-dependency Model Context Protocol (MCP) server over stdio

Archetypes:
  b2b-saas-workspace | ai-chat-canvas | analytics-dashboard | ecommerce-storefront | developer-tool

Product Presets (--preset):
  linear | chatgpt-canvas | claude-artifacts | stripe-dashboard | datadog | shopify-storefront | supabase-studio | vercel-console

Examples:
  npx ux-md init --preset linear --project "Acme Workspace"
  npx ux-md validate UX.md --strict --check-code
  npx ux-md scaffold UX.md --out-dir src/components/ux
  npx ux-md preview UX.md --output ux-preview.html
  npx ux-md diff UX.old.md UX.md --json
  npx ux-md mcp`);
}

if (!command || command === '--help' || command === '-h' || command === 'help') {
  printHelp();
  process.exit(0);
}

if (command === '--version' || command === '-v' || command === 'version') {
  const pkgPath = path.join(rootDir, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  console.log(pkg.version);
  process.exit(0);
}

function runScript(scriptPath, forwardArgs) {
  const res = spawnSync(process.execPath, [scriptPath, ...forwardArgs], {
    stdio: 'inherit',
    cwd: process.cwd()
  });
  process.exit(res.status ?? 1);
}

if (command === 'init') {
  const hasArchetype = subArgs.includes('--archetype');
  const hasPreset = subArgs.includes('--preset') || subArgs.includes('--list-presets');
  const hasFromScan = subArgs.includes('--from-scan');
  if (!hasArchetype && !hasPreset && !hasFromScan) {
    const extractPath = path.join(scriptsDir, 'extract-ux.mjs');
    const extractRes = spawnSync(process.execPath, [extractPath, '.'], {
      encoding: 'utf8',
      cwd: process.cwd()
    });
    if (extractRes.status === 0 && extractRes.stdout) {
      try {
        const scanData = JSON.parse(extractRes.stdout);
        const inferredArch = scanData.inferred_archetype || 'b2b-saas-workspace';
        const inferredProj = scanData.project || path.basename(process.cwd());
        const genArgs = ['--archetype', inferredArch];
        if (!subArgs.includes('--project')) {
          genArgs.push('--project', inferredProj);
        }
        runScript(path.join(scriptsDir, 'generate-ux.mjs'), [...genArgs, ...subArgs]);
      } catch {
        runScript(path.join(scriptsDir, 'generate-ux.mjs'), subArgs);
      }
    }
  }
  runScript(path.join(scriptsDir, 'generate-ux.mjs'), subArgs);
}

const commandMap = {
  extract: path.join(scriptsDir, 'extract-ux.mjs'),
  generate: path.join(scriptsDir, 'generate-ux.mjs'),
  validate: path.join(scriptsDir, 'validate-ux.mjs'),
  lint: path.join(scriptsDir, 'validate-ux.mjs'),
  scaffold: path.join(scriptsDir, 'scaffold-ux.mjs'),
  preview: path.join(scriptsDir, 'preview-ux.mjs'),
  diff: path.join(scriptsDir, 'diff-ux.mjs'),
  mcp: path.join(rootDir, 'scripts', 'mcp-server.mjs')
};

const targetScript = commandMap[command];
if (!targetScript) {
  console.error(`Unknown command: "${command}". Run "npx ux-md --help" for available commands.`);
  process.exit(1);
}

runScript(targetScript, subArgs);
