#!/usr/bin/env node
/**
 * OpenLog CLI
 * ───────────
 * Entry point for the `openlog` command-line tool.
 *
 * Usage:
 *   openlog                      → alias for `openlog serve`
 *   openlog serve [--port N]     → start HTTP API + dashboard
 *   openlog mcp                  → start MCP stdio server (for AI clients)
 *   openlog dashboard [--port N] → start server and open the dashboard URL
 *   openlog init                 → initialise data directory and DB only
 *   openlog --help | -h          → show help
 *   openlog --version | -v       → show version
 */

import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

// ── Version resolution ────────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const _require = createRequire(import.meta.url);

function getVersion(): string {
  // Compiled: dist/cli/openlog.js → go up to package root
  const pkgPath = join(__dirname, '..', '..', 'package.json');
  if (existsSync(pkgPath)) {
    const pkg = _require(pkgPath) as { version?: string };
    return pkg.version ?? '0.0.0';
  }
  return '0.0.0';
}

// ── Argument parsing ─────────────────────────────────────────────────────────
interface ParsedArgs {
  command: 'serve' | 'mcp' | 'dashboard' | 'init' | 'help' | 'version';
  port: number;
  open: boolean;
}

function parseArgs(argv: string[]): ParsedArgs {
  const args = argv.slice(2); // strip node + script path

  let command: ParsedArgs['command'] = 'serve'; // default
  let port = Number(process.env.PORT ?? '3000');
  let open = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case 'serve':
        command = 'serve';
        break;
      case 'mcp':
        command = 'mcp';
        break;
      case 'dashboard':
        command = 'dashboard';
        open = true; // dashboard command implies opening the browser
        break;
      case 'init':
        command = 'init';
        break;
      case '--help':
      case '-h':
        command = 'help';
        break;
      case '--version':
      case '-v':
        command = 'version';
        break;
      case '--port':
      case '-p': {
        const next = args[i + 1];
        if (next && /^\d+$/.test(next)) {
          port = parseInt(next, 10);
          i++;
        } else {
          printError(`--port requires a numeric value`);
          process.exit(1);
        }
        break;
      }
      case '--no-open':
        open = false;
        break;
      default:
        if (arg.startsWith('--port=')) {
          port = parseInt(arg.split('=')[1], 10);
        } else if (!arg.startsWith('-')) {
          // Treat unknown positional as the command (graceful)
          command = arg as ParsedArgs['command'];
        } else {
          printError(`Unknown option: ${arg}`);
          process.exit(1);
        }
    }
  }

  return { command, port, open };
}

// ── Output helpers ────────────────────────────────────────────────────────────
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const CYAN = '\x1b[36m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const DIM = '\x1b[2m';

function printBanner(version: string): void {
  process.stdout.write(`\n${BOLD}${CYAN}  OpenLog${RESET} ${DIM}v${version}${RESET}\n`);
  process.stdout.write(`${DIM}  Structured logging & AI assistant tool${RESET}\n\n`);
}

function printError(msg: string): void {
  process.stderr.write(`\x1b[31mError:\x1b[0m ${msg}\n`);
}

function printHelp(version: string): void {
  printBanner(version);
  process.stdout.write(`${BOLD}Usage:${RESET}\n`);
  process.stdout.write(`  ${GREEN}openlog${RESET}                      Start the HTTP API + dashboard\n`);
  process.stdout.write(`  ${GREEN}openlog serve${RESET} [--port N]     Start HTTP API + dashboard\n`);
  process.stdout.write(`  ${GREEN}openlog dashboard${RESET} [--port N] Start server and open dashboard URL\n`);
  process.stdout.write(`  ${GREEN}openlog mcp${RESET}                  Start MCP stdio server (for AI clients)\n`);
  process.stdout.write(`  ${GREEN}openlog init${RESET}                 Initialise data directory and database\n`);
  process.stdout.write(`  ${GREEN}openlog --help${RESET}               Show this help message\n`);
  process.stdout.write(`  ${GREEN}openlog --version${RESET}            Show version number\n`);
  process.stdout.write(`\n${BOLD}Options:${RESET}\n`);
  process.stdout.write(`  ${YELLOW}--port, -p${RESET}  N  TCP port for HTTP server (default: 3000)\n`);
  process.stdout.write(`  ${YELLOW}--no-open${RESET}      Don't open browser (dashboard command)\n`);
  process.stdout.write(`\n${BOLD}Examples:${RESET}\n`);
  process.stdout.write(`  npx openlog                    # start dashboard\n`);
  process.stdout.write(`  npx openlog serve --port 8080  # custom port\n`);
  process.stdout.write(`  npx openlog mcp                # MCP mode for Claude Desktop\n`);
  process.stdout.write(`\n${BOLD}MCP Config (Claude Desktop / Cursor / Continue):${RESET}\n`);
  process.stdout.write(`  {\n`);
  process.stdout.write(`    "mcpServers": {\n`);
  process.stdout.write(`      "openlog": {\n`);
  process.stdout.write(`        "command": "npx",\n`);
  process.stdout.write(`        "args": ["-y", "openlog", "mcp"]\n`);
  process.stdout.write(`      }\n`);
  process.stdout.write(`    }\n`);
  process.stdout.write(`  }\n\n`);
}

function printDashboardInfo(port: number): void {
  const url = `http://localhost:${port}`;
  process.stdout.write(`\n${BOLD}${GREEN}  ✓ OpenLog is running!${RESET}\n\n`);
  process.stdout.write(`  ${BOLD}Dashboard:${RESET}  ${CYAN}${url}${RESET}\n`);
  process.stdout.write(`  ${BOLD}API:${RESET}        ${CYAN}${url}/api${RESET}\n`);
  process.stdout.write(`  ${BOLD}Health:${RESET}     ${CYAN}${url}/health${RESET}\n`);
  process.stdout.write(`\n  ${DIM}Press Ctrl+C to stop${RESET}\n\n`);
}

async function openBrowser(url: string): Promise<void> {
  // Avoid external dependencies — use the OS default opener.
  try {
    const { spawn } = await import('node:child_process');

    const platform = process.platform;
    const cmd =
      platform === 'darwin'
        ? 'open'
        : platform === 'win32'
          ? 'cmd'
          : 'xdg-open';

    const cmdArgs =
      platform === 'win32'
        ? ['/c', 'start', '', url]
        : [url];

    const child = spawn(cmd, cmdArgs, { stdio: 'ignore', detached: true });
    child.unref();
  } catch {
    // no-op — URL is already printed
  }
}

// ── Command handlers ──────────────────────────────────────────────────────────
async function runServe(port: number, openBrowserFlag: boolean): Promise<void> {
  const { startApi } = await import('../runtime/startApi.js');

  startApi({
    port,
    onReady: (resolvedPort) => {
      printDashboardInfo(resolvedPort);
      if (openBrowserFlag) {
        const url = `http://localhost:${resolvedPort}`;
        void openBrowser(url);
      }
    },
  });
}

async function runMcp(): Promise<void> {
  // In MCP mode ALL stdout must belong to the JSON-RPC protocol.
  // Silence our own logger to avoid corrupting the stream.
  process.env.OPENLOG_SILENT = '1';

  const { startMcp } = await import('../runtime/startMcp.js');
  await startMcp();
}

async function runInit(): Promise<void> {
  const { bootstrap } = await import('../bootstrap.js');
  const { OPENLOG_HOME, OPENLOG_DB } = await import('../utils/paths.js');

  bootstrap();

  process.stdout.write(`\n${BOLD}${GREEN}  ✓ OpenLog initialised!${RESET}\n\n`);
  process.stdout.write(`  ${BOLD}Data directory:${RESET} ${OPENLOG_HOME}\n`);
  process.stdout.write(`  ${BOLD}Database:${RESET}       ${OPENLOG_DB}\n\n`);
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  const version = getVersion();
  const { command, port, open } = parseArgs(process.argv);

  switch (command) {
    case 'help':
      printHelp(version);
      process.exit(0);
      break;

    case 'version':
      process.stdout.write(`${version}\n`);
      process.exit(0);
      break;

    case 'init':
      await runInit();
      break;

    case 'mcp':
      await runMcp();
      break;

    case 'dashboard':
      printBanner(version);
      await runServe(port, open);
      break;

    case 'serve':
    default:
      printBanner(version);
      await runServe(port, false);
      break;
  }
}

main().catch((err: unknown) => {
  printError(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
