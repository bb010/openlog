# OpenLog Package Distribution & Dashboard CLI - Implementation Plan

## Overview
Convert OpenLog into an installable npm package that supports:
1. **MCP usage** (for Claude/Desktop and other MCP clients)
2. **HTTP API + frontend dashboard access** via a simple CLI command
3. **Automatic local initialization** (database + storage directories) on first run

The goal is that users can install once, run a command, and immediately use OpenLog through MCP and/or browser dashboard.

---

## Current State Analysis

### Codebase Structure
- `src/` → Backend (Hono API, MCP server, SQLite init, services)
- `frontend/` → React + Vite dashboard (separate app)
- Root `package.json` → backend build/run scripts only
- No current package CLI binary (`bin`) configured
- No current static hosting integration for frontend in backend server

### Technologies and Frameworks in Use
- Backend: TypeScript, Hono, Node built-in `node:sqlite`
- MCP: `@modelcontextprotocol/sdk` stdio transport
- Frontend: React + TypeScript + Vite
- Build: `tsc` for backend, Vite for frontend

### Related Existing Code
- `src/index.ts` initializes DB, starts HTTP API, and starts MCP server together
- `src/db/init.ts` creates schema automatically during startup (`db.exec(SCHEMA)`)
- `src/utils/paths.ts` defines `~/.openlog` paths and ensures directories
- `frontend/src/utils/constants.ts` uses `VITE_API_URL` fallback to `http://localhost:3000`
- `frontend/vite.config.ts` proxies `/api` to backend in dev mode

### Key Gaps vs Requested Outcome
1. No npm package CLI for end users (`openlog ...` command)
2. No explicit MCP-only start mode for safe stdio package usage
3. No packaged frontend artifact served by backend
4. No dashboard launch command that prints/opens frontend URL
5. `.env.example` mentions `OPENLOG_HOME`, but code currently does not honor env override in `paths.ts`

---

## Requirements

### Functional Requirements
- **FR-001**: User can install package globally or use via `npx`.
- **FR-002**: Package exposes CLI command(s) to start OpenLog in different modes:
  - MCP mode
  - API + Dashboard mode
  - Optional all-in-one mode
- **FR-003**: On first initialization, storage directories and SQLite DB are auto-created.
- **FR-004**: Frontend dashboard is accessible via command and URL output to user.
- **FR-005**: MCP mode must remain usable by MCP clients via stdio.
- **FR-006**: Package documentation includes install + run instructions for MCP config and dashboard access.

### Non-Functional Requirements
- **NFR-001**: Preserve existing API and MCP tool behavior.
- **NFR-002**: Keep setup zero-config for default users (`~/.openlog`).
- **NFR-003**: Avoid stdout noise in strict MCP stdio mode.
- **NFR-004**: Build/release process should be reproducible and publish-ready.

### Acceptance Criteria
- [x] `npm i -g <package>` or `npx <package>` can run CLI commands.
- [x] Running MCP command initializes DB and tools without manual DB setup.
- [x] Running dashboard command starts server and exposes dashboard URL.
- [x] Dashboard is reachable in browser and can read data from API.
- [x] `README.md` contains tested instructions for both MCP and dashboard flows.
- [x] Published tarball includes required `dist` and frontend static assets.

---

## Technical Approach

### Architecture Changes
Introduce **separated runtime entrypoints** instead of one monolithic `src/index.ts` startup:

1. **Core bootstrap module**
   - Initializes directories + DB once
   - Shared by API and MCP starters

2. **App factory module**
   - Builds Hono app without immediately starting it
   - Reused by CLI/server launcher

3. **CLI runtime**
   - `openlog mcp` → starts MCP server only (safe stdio focus)
   - `openlog serve` → starts API + serves dashboard static build
   - `openlog dashboard` → starts/ensures server and prints URL (optionally opens browser)
   - `openlog all` (optional) → starts API + MCP together for local dev

4. **Frontend packaging**
   - Build frontend with Vite
   - Copy build output into package distribution (e.g., `dist/public`)
   - Backend serves static assets under `/`

### Data Model Changes
- No schema changes required.
- Keep current `SCHEMA` and initialization flow.

### API Changes
- Existing API endpoints unchanged.
- Add static dashboard route handling:
  - `GET /` serves frontend `index.html`
  - `GET /assets/*` serves built assets
  - SPA fallback route for frontend paths

---

## Implementation Plan

### Phase 1: Packaging Foundation & Runtime Refactor (Estimated: 6-8 hours)
**Objective**: Prepare backend for package-friendly startup modes.

**Tasks**:
1. **Extract startup concerns into modules** ✅ (2.5h)
   - File: `src/index.ts`
   - Action: Modify
   - Details: Converted to thin compatibility entrypoint — delegates to new startup modules.

2. **Create shared bootstrap/init module** ✅ (1.5h)
   - File: `src/bootstrap.ts` (new)
   - Action: Create
   - Details: Centralized DB init + `setDatabase()` + storage checks.

3. **Create API and MCP dedicated start modules** ✅ (2h)
   - Files: `src/runtime/startApi.ts`, `src/runtime/startMcp.ts` (new)
   - Action: Create
   - Details: Separate run modes for CLI usage and MCP config safety.

4. **Make paths env-configurable** ✅ (1h)
   - File: `src/utils/paths.ts`
   - Action: Modify
   - Details: Respects `OPENLOG_HOME` from env to match `.env.example`.

**Deliverables**:
- [x] App has clear start modes (api/mcp/all)
- [x] DB initialization reusable and deterministic
- [x] Storage path override works

**Dependencies**: None — **COMPLETE** ✅

---

### Phase 2: CLI Commands & NPM Package Metadata (Estimated: 5-7 hours)
**Objective**: Expose installable commands for users.

**Tasks**:
1. **Implement CLI command parser** ✅ (2.5h)
   - File: `src/cli/openlog.ts` (new)
   - Action: Create
   - Details: Supports `serve`, `mcp`, `dashboard`, `init`, `--port`, `--help`.

2. **Add executable bin wrapper** ✅ (1.5h)
   - Files: `bin/openlog` (new), `package.json`
   - Action: Create/Modify
   - Details: Runtime includes Node sqlite flag; delegates to dist CLI.

3. **Update package metadata for publishing** ✅ (1.5h)
   - File: `package.json`
   - Action: Modify
   - Details: Added `bin`, `files`, `exports`, `prepack`/build scripts.

4. **Add command UX output** ✅ (1h)
   - File: `src/cli/openlog.ts`
   - Action: Modify
   - Details: Prints clear URLs and next-step instructions with colors.

**Deliverables**:
- [x] `openlog` CLI available after install
- [x] Users can run MCP mode and dashboard mode from CLI
- [x] Package is publish-ready

**Dependencies**: Phase 1 — **COMPLETE** ✅

---

### Phase 3: Frontend Packaging & Static Hosting (Estimated: 5-6 hours)
**Objective**: Make dashboard available from package command.

**Tasks**:
1. **Build frontend as part of package build** ✅ (1.5h)
   - Files: root `package.json`, `frontend/package.json`
   - Action: Modify
   - Details: Added root scripts to run frontend build before pack/publish.

2. **Copy frontend dist into backend dist/public** ✅ (1.5h)
   - Files: `scripts/build-frontend.mjs` (updated), `scripts/copy-frontend.mjs` (new)
   - Action: Create/Modify
   - Details: Packaged tarball contains all static assets.

3. **Serve static assets from Hono** ✅ (2h)
   - Files: `src/server/app.ts` (new)
   - Action: Modify
   - Details: Added static middleware and SPA fallback for React router.

4. **Dashboard command behavior** ✅ (1h)
   - File: `src/cli/openlog.ts`
   - Action: Modify
   - Details: `openlog dashboard` starts server, prints URL, auto-opens browser.

**Deliverables**:
- [x] Frontend bundled into published package
- [x] Dashboard loads from backend URL
- [x] Command output gives direct link

**Dependencies**: Phase 2 — **COMPLETE** ✅

---

### Phase 4: Testing & Validation (Estimated: 4-6 hours)
**Objective**: Ensure install/run workflows work on clean machine.

**Test Results** ✅:
1. ✅ CLI argument parsing works (--help, --version, --port, commands)
2. ✅ First-run DB creation succeeds (idempotent bootstrap)
3. ✅ End-to-end validation:
   - `npm pack --dry-run` — 149 files, 1.2MB, includes dist/public/ ✓
   - `npm run build:backend` — clean ✓
   - `npm run build:frontend` — 2750 modules ✓
   - `openlog serve --port 3010` — server starts, URLs printed ✓
   - `GET /health` — working ✓
   - `GET /` (dashboard) — 200 ✓
   - `GET /api/projects` — real data ✓
   - SPA fallback routes — working ✓
   - `scripts/copy-frontend.mjs` standalone — working ✓

**Test Files to Create/Update**:
- `test-mcp-import.mjs` (update or replace with real CLI smoke)
- New: `scripts/smoke-test-package.mjs`
- Update docs test sections in `TESTING.md`

---

## File Changes Summary

### Files to Create
- `src/bootstrap.ts` - Shared initialization (dirs + DB)
- `src/runtime/startApi.ts` - API server starter
- `src/runtime/startMcp.ts` - MCP-only starter
- `src/cli/openlog.ts` - CLI command entrypoint
- `bin/openlog` - npm executable wrapper
- `scripts/copy-frontend.mjs` - Copy Vite build to package output
- (optional) `src/server/app.ts` - Hono app factory

### Files to Modify
- `package.json` - bin, scripts, package publish config
- `src/index.ts` - delegate to refactored runtime modules
- `src/utils/paths.ts` - env override for OPENLOG_HOME
- `README.md` - package install/use docs
- `MCP_DESCRIPTION.md` - MCP config using package command
- `TESTING.md` - new package + CLI verification steps
- `frontend/package.json` - ensure deterministic production build

### Configuration Updates
- Root build pipeline to include frontend build artifacts
- Possibly add `.npmignore`/`files` field refinement in `package.json`

---

## Dependencies & Integration

### External Dependencies (Potential)
- Optional CLI parser: `commander` or `yargs` (or keep zero-dependency manual parsing)
- Optional static copy utility: `cpy-cli` / custom Node script
- Optional browser open utility: `open`

### Internal Dependencies
- CLI depends on runtime starters and bootstrap
- API & MCP starters both depend on DB initialization
- Frontend serves data from existing `/api/*` endpoints

---

## Risks & Considerations

### Technical Risks
- **Risk 1: MCP stdio corruption from stdout logs**
  - Mitigation: In MCP mode, redirect app logs to stderr or disable non-protocol stdout.

- **Risk 2: Node sqlite runtime flag requirements for end users**
  - Mitigation: Use bin wrapper that launches Node with required flags (if still necessary).

- **Risk 3: Frontend artifacts missing in npm package**
  - Mitigation: enforce `prepack` build + tarball verification (`npm pack --dry-run`).

- **Risk 4: Port conflicts for dashboard command**
  - Mitigation: support `--port` and clear startup error messaging.

### Breaking Changes
- Refactoring `src/index.ts` entry behavior could affect existing local scripts.
- Keep backward-compatible `npm run dev/start` scripts to reduce disruption.

---

## Testing Strategy

### Unit Tests
- CLI argument parsing and command dispatch
- bootstrap init idempotency

### Integration Tests
- First-run path creation (`~/.openlog` or overridden path)
- DB schema exists after `openlog init` / first launch
- `openlog serve` serves API + frontend index
- `openlog mcp` exposes tools without protocol noise

### Manual Testing Checklist
- [x] `npm pack` contains CLI and frontend files
- [x] Fresh machine: install package and run `openlog serve`
- [x] Browser opens dashboard URL and can create project/entry
- [x] MCP config command launches successfully in Claude Desktop
- [x] Re-run startup commands; init remains idempotent

---

## Rollout Plan

### Prerequisites
- Decide final package name and command name (`openlog`)
- Confirm Node runtime minimum and sqlite flag policy

### Development Environment Setup
```bash
npm install
npm run build
npm pack --dry-run
```

For full validation:
```bash
npm pack
npm i -g ./openlog-<version>.tgz
openlog --help
openlog serve
openlog mcp
```

### Deployment Considerations
- Publish npm package with semantic versioning
- Tag release notes with CLI commands and MCP setup changes
- Optionally provide feature flag/env for enabling/disabling HTTP/MCP combined mode

---

## Success Metrics
- Metric 1: New user reaches working dashboard in <2 commands
- Metric 2: MCP setup works via package command without manual code checkout
- Metric 3: First-run initialization succeeds without manual DB steps
- Metric 4: Package install/start issue rate remains low after release

---

## Open Questions
- Should `openlog mcp` run MCP-only (recommended) or API+MCP together by default?
- Should `openlog dashboard` open browser automatically, or only print URL?
- Do we want separate commands for `serve` and `dashboard`, or a single `start` command?
- Is package intended for npm public registry or private/internal distribution?

---

## References

### Relevant Existing Code
- `src/index.ts` - Current combined startup flow (HTTP + MCP + DB init)
- `src/db/init.ts` - DB initialization and schema application
- `src/db/schema.ts` - SQLite schema
- `src/utils/paths.ts` - storage paths and directory creation
- `src/mcp/server.ts` - MCP server bootstrapping
- `frontend/src/utils/constants.ts` - API URL behavior for dashboard
- `frontend/vite.config.ts` - frontend dev proxy and build setup

### Documentation
- `README.md` - backend runtime docs
- `MCP_DESCRIPTION.md` - MCP integration docs
- `TESTING.md` - current testing workflow

---

## Appendix

### Code Patterns to Follow
- Keep service layer usage pattern (routes → services → db modules)
- Reuse `initializeDatabase()` + `setDatabase()` flow instead of duplicate DB logic
- Preserve existing response format and tool contract consistency

### Naming Conventions
- Keep lowercase kebab command naming (`openlog`)
- Runtime files in `src/runtime/*` and CLI in `src/cli/*`
- Continue `*.ts` modules with ESM import style and explicit `.js` runtime extensions where used
