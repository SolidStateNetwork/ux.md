#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const scriptsDir = path.join(rootDir, 'skills', 'ux-md-generator', 'scripts');

const TOOLS = [
  {
    name: 'ux_extract',
    description:
      'Scan a target directory (package.json, AGENTS.md, DESIGN.md, and source routes in src/app or src/pages) and return structured UX metadata JSON.',
    inputSchema: {
      type: 'object',
      properties: {
        directory: {
          type: 'string',
          description: 'Target repository directory to scan (defaults to current working directory).'
        },
        output: {
          type: 'string',
          description: 'Optional output JSON file path.'
        }
      }
    }
  },
  {
    name: 'ux_generate',
    description:
      'Generate a 12-section UX.md v1 specification from an archetype preset (b2b-saas-workspace, ai-chat-canvas, analytics-dashboard, ecommerce-storefront, developer-tool) or a scan file.',
    inputSchema: {
      type: 'object',
      properties: {
        archetype: {
          type: 'string',
          enum: [
            'b2b-saas-workspace',
            'ai-chat-canvas',
            'analytics-dashboard',
            'ecommerce-storefront',
            'developer-tool'
          ],
          description: 'UX archetype preset.'
        },
        project: {
          type: 'string',
          description: 'Project display name.'
        },
        profile: {
          type: 'string',
          enum: ['web-app', 'mobile-native', 'desktop-app', 'terminal-tui'],
          description: 'Platform profile (defaults to web-app).'
        },
        from_scan: {
          type: 'string',
          description: 'Optional path to a ux-scan.json file produced by ux_extract.'
        },
        output: {
          type: 'string',
          description: 'Output file path (defaults to UX.md).'
        }
      }
    }
  },
  {
    name: 'ux_validate',
    description:
      'Validate a UX.md file against 12 structural linter rules (viewport budget math, z-index collisions, route reachability, 4-state view matrix, vague prose, and live code route parity).',
    inputSchema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          description: 'Path to UX.md file (defaults to UX.md).'
        },
        strict: {
          type: 'boolean',
          description: 'Fail on warnings in addition to errors.'
        },
        check_code: {
          type: 'boolean',
          description: 'Verify live route parity against src/app, src/pages, or src/routes.'
        },
        source_dir: {
          type: 'string',
          description: 'Optional source directory when check_code is true.'
        }
      }
    }
  },
  {
    name: 'ux_preview',
    description:
      'Render an interactive standalone HTML wireframe and breakpoint simulator (1280px / 768px / 375px) from a UX.md specification.',
    inputSchema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          description: 'Path to UX.md file (defaults to UX.md).'
        },
        output: {
          type: 'string',
          description: 'Output HTML file path (defaults to ux-preview.html).'
        }
      }
    }
  },
  {
    name: 'ux_diff',
    description:
      'Compare two UX.md files and report route additions/removals, archetype changes, viewport budget shifts, and threshold regressions as JSON.',
    inputSchema: {
      type: 'object',
      properties: {
        old_file: {
          type: 'string',
          description: 'Baseline UX.md file path.'
        },
        new_file: {
          type: 'string',
          description: 'Updated UX.md file path.'
        }
      },
      required: ['old_file', 'new_file']
    }
  }
];

function invokeCliScript(scriptName, cliArgs) {
  const scriptPath = path.join(scriptsDir, scriptName);
  const res = spawnSync(process.execPath, [scriptPath, ...cliArgs], {
    encoding: 'utf8',
    cwd: process.cwd()
  });
  const output = [res.stdout?.trim(), res.stderr?.trim()].filter(Boolean).join('\n');
  return {
    isError: res.status !== 0,
    content: [{ type: 'text', text: output || (res.status === 0 ? 'OK' : 'Command failed') }]
  };
}

function handleToolCall(name, args = {}) {
  switch (name) {
    case 'ux_extract': {
      const cliArgs = [args.directory || '.'];
      if (args.output) cliArgs.push('--output', args.output);
      return invokeCliScript('extract-ux.mjs', cliArgs);
    }
    case 'ux_generate': {
      const cliArgs = [];
      if (args.from_scan) cliArgs.push('--from-scan', args.from_scan);
      if (args.archetype) cliArgs.push('--archetype', args.archetype);
      if (args.project) cliArgs.push('--project', args.project);
      if (args.profile) cliArgs.push('--profile', args.profile);
      cliArgs.push('--output', args.output || 'UX.md');
      return invokeCliScript('generate-ux.mjs', cliArgs);
    }
    case 'ux_validate': {
      const cliArgs = [args.file || 'UX.md', '--json'];
      if (args.strict) cliArgs.push('--strict');
      if (args.check_code) {
        cliArgs.push('--check-code');
        if (args.source_dir) cliArgs.push(args.source_dir);
      }
      return invokeCliScript('validate-ux.mjs', cliArgs);
    }
    case 'ux_preview': {
      const cliArgs = [args.file || 'UX.md', '--output', args.output || 'ux-preview.html'];
      return invokeCliScript('preview-ux.mjs', cliArgs);
    }
    case 'ux_diff': {
      const cliArgs = [args.old_file, args.new_file, '--json'];
      return invokeCliScript('diff-ux.mjs', cliArgs);
    }
    default:
      return {
        isError: true,
        content: [{ type: 'text', text: `Unknown tool: ${name}` }]
      };
  }
}

let useContentLengthFraming = false;

function sendMessage(msg) {
  const json = JSON.stringify(msg);
  if (useContentLengthFraming) {
    const byteLen = Buffer.byteLength(json, 'utf8');
    process.stdout.write(`Content-Length: ${byteLen}\r\n\r\n${json}`);
  } else {
    process.stdout.write(`${json}\n`);
  }
}

function handleRpcMessage(msg) {
  if (!msg || typeof msg !== 'object') return;

  if (msg.method === 'initialize') {
    sendMessage({
      jsonrpc: '2.0',
      id: msg.id,
      result: {
        protocolVersion: msg.params?.protocolVersion || '2024-11-05',
        capabilities: {
          tools: {},
          resources: {}
        },
        serverInfo: {
          name: 'ux-md-mcp',
          version: '1.0.0'
        }
      }
    });
    return;
  }

  if (msg.method === 'notifications/initialized' || msg.id === undefined) {
    return;
  }

  if (msg.method === 'ping') {
    sendMessage({ jsonrpc: '2.0', id: msg.id, result: {} });
    return;
  }

  if (msg.method === 'tools/list') {
    sendMessage({
      jsonrpc: '2.0',
      id: msg.id,
      result: { tools: TOOLS }
    });
    return;
  }

  if (msg.method === 'tools/call') {
    const result = handleToolCall(msg.params?.name, msg.params?.arguments);
    sendMessage({
      jsonrpc: '2.0',
      id: msg.id,
      result
    });
    return;
  }

  if (msg.method === 'resources/list') {
    const specUri = `file://${path.join(rootDir, 'docs', 'spec.md')}`;
    sendMessage({
      jsonrpc: '2.0',
      id: msg.id,
      result: {
        resources: [
          {
            uri: specUri,
            name: 'UX.md v1.0 Specification',
            description: 'Formal 12-section specification and YAML frontmatter schema for UX.md.',
            mimeType: 'text/markdown'
          }
        ]
      }
    });
    return;
  }

  if (msg.method === 'resources/read') {
    const specPath = path.join(rootDir, 'docs', 'spec.md');
    const text = fs.existsSync(specPath) ? fs.readFileSync(specPath, 'utf8') : '';
    sendMessage({
      jsonrpc: '2.0',
      id: msg.id,
      result: {
        contents: [
          {
            uri: msg.params?.uri || `file://${specPath}`,
            mimeType: 'text/markdown',
            text
          }
        ]
      }
    });
    return;
  }

  sendMessage({
    jsonrpc: '2.0',
    id: msg.id,
    error: {
      code: -32601,
      message: `Method not found: ${msg.method}`
    }
  });
}

let buffer = Buffer.alloc(0);

process.stdin.on('data', (chunk) => {
  buffer = Buffer.concat([buffer, chunk]);

  while (buffer.length > 0) {
    const str = buffer.toString('utf8');
    if (str.startsWith('Content-Length:')) {
      useContentLengthFraming = true;
      const headerEnd = buffer.indexOf('\r\n\r\n');
      if (headerEnd === -1) break;
      const headerText = buffer.subarray(0, headerEnd).toString('utf8');
      const match = headerText.match(/Content-Length:\s*(\d+)/i);
      if (!match) {
        buffer = Buffer.alloc(0);
        break;
      }
      const contentLen = Number(match[1]);
      const bodyStart = headerEnd + 4;
      if (buffer.length < bodyStart + contentLen) break;
      const bodyJson = buffer.subarray(bodyStart, bodyStart + contentLen).toString('utf8');
      buffer = buffer.subarray(bodyStart + contentLen);
      try {
        handleRpcMessage(JSON.parse(bodyJson));
      } catch {
        // Ignore malformed frame
      }
    } else {
      const newlineIdx = buffer.indexOf('\n');
      if (newlineIdx === -1) break;
      const line = buffer.subarray(0, newlineIdx).toString('utf8').trim();
      buffer = buffer.subarray(newlineIdx + 1);
      if (!line) continue;
      try {
        handleRpcMessage(JSON.parse(line));
      } catch {
        // Ignore non-JSON line
      }
    }
  }
});
