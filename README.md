# OpenLog

**Structured logging platform with MCP tools for AI agents and a browser dashboard.**

OpenLog lets AI agents (Claude, Cursor, Continue…) log structured, timestamped entries to organized projects — all backed by a zero-config SQLite database at `~/.openlog`. A built-in React dashboard lets you browse, search, and visualize logs in your browser.

---

## Quick Start

### Option 1 — `npx` (no install required)

```bash
# Start the dashboard (API + frontend)
npx openlog

# Or with a custom port
npx openlog serve --port 8080

# Open browser automatically
npx openlog dashboard
```

### Option 2 — Global install

```bash
npm install -g openlog

openlog serve            # API + dashboard at http://localhost:3000
openlog dashboard        # same, but also opens your browser
openlog --help           # full usage
```

### Option 3 — MCP for AI clients (Claude Desktop, Cursor, Continue…)

Add to your MCP client config and **that's it** — no manual setup:

```json
{
  "mcpServers": {
    "openlog": {
      "command": "npx",
      "args": ["-y", "openlog", "mcp"]
    }
  }
}
```

OpenLog auto-creates `~/.openlog/` and the database on first run.

---

## How It All Works

### The Big Picture

OpenLog is a **dual-mode logging system:**

**Mode 1 — MCP Server** (`openlog mcp`)
- Runs silently in the background
- Exposes 3 tools to your AI client (Claude, Cursor, Continue)
- AI agents log structured entries directly
- Perfect for: automating logs during agent runs, debugging AI workflows

**Mode 2 — Web Dashboard** (`openlog serve` or `openlog dashboard`)
- HTTP server + React UI at `localhost:3000`
- Browse, search, and visualize all logs
- Perfect for: reviewing logs, spotting trends, investigating issues

**Both modes share the same SQLite database**, so:
- Log via MCP while browsing the dashboard
- Use the dashboard to review logs created by MCP tools
- Use the REST API for custom integrations

### Architecture Overview

```
Your AI Client                    Your Browser
(Claude/Cursor/Continue)          (Chrome/Firefox/Safari)
       │                                 │
       │ (MCP Protocol)                  │ (HTTP)
       ▼                                 ▼
   ┌─────────────────────────────────────────┐
   │         OpenLog Package (npx)           │
   │  ┌─────────────────────────────────────┐│
   │  │ MCP Server (stdio)   HTTP Server    ││
   │  │ • create_project     • GET /        ││
   │  │ • create_entry    ┌──• GET /api    ││
   │  │ • search_entries  │  • POST /api   ││
   │  │                   │   ▼            ││
   │  │                   └─ React SPA     ││
   │  │                     (Dashboard)    ││
   │  └─────────────────────────────────────┘│
   │              │                          │
   │              ▼                          │
   │   ┌───────────────────────┐             │
   │   │  ~/.openlog/          │             │
   │   │  ├── openlog.db       │             │
   │   │  │   (SQLite)         │             │
   │   │  └── images/          │             │
   │   └───────────────────────┘             │
   └─────────────────────────────────────────┘
```

### Data Flow Example: Creating a Log Entry

**Via MCP (from AI Agent):**
```
AI Agent calls create_entry("projectId", "My log message")
           ↓
     MCP Server receives tool call (JSON-RPC)
           ↓
     Validates project ID and message content
           ↓
     Writes to SQLite at ~/.openlog/openlog.db
           ↓
     Returns { success: true, data: { id, timestamp, ... } }
           ↓
     AI Agent receives response over MCP protocol
```

**Via Dashboard (from Web Browser):**
```
User types message in browser UI
           ↓
     React component calls REST API (POST /api/projects/:id/entries)
           ↓
     HTTP server validates request
           ↓
     Writes to SQLite at ~/.openlog/openlog.db
           ↓
     API returns JSON response
           ↓
     React UI updates with new entry
```

**Both paths** write to the same database, so entries created via MCP appear instantly in the dashboard (and vice versa).

---

## CLI Commands

| Command | Description |
|---|---|
| `openlog` | Start HTTP API + dashboard (default) |
| `openlog serve [--port N]` | Start HTTP API + dashboard |
| `openlog dashboard [--port N]` | Start server and open browser |
| `openlog mcp` | Start MCP stdio server for AI clients |
| `openlog init` | Initialise data directory and database only |
| `openlog --help` | Show usage |
| `openlog --version` | Show version |

**Options**

| Flag | Description |
|---|---|
| `--port N`, `-p N` | Port for the HTTP server (default `3000`, or `PORT` env) |
| `--no-open` | Don't open the browser (for `dashboard` command) |

**Environment variables**

| Variable | Description |
|---|---|
| `PORT` | HTTP server port (overridden by `--port`) |
| `OPENLOG_HOME` | Override data directory (default `~/.openlog`) |
| `OPENLOG_SILENT` | Set to `1` to suppress all log output |

---

## MCP Tools

When running `openlog mcp`, three tools become available to AI clients over the Model Context Protocol (stdio transport):

### 1. `create_project`
Create a new project to organize log entries. Ideal for categorizing logs by use case, environment, or feature.

**Parameters:**

| Name | Type | Required | Description |
|---|---|---|---|
| `name` | string | ✅ | Unique project name (1–255 chars) |
| `path` | string | ✅ | File-system path this project monitors (e.g., `/Users/you/myapp`) |
| `description` | string | ❌ | Optional description (max 1,000 chars) |

**Example:**

```json
{
  "name": "AI Agent Logs",
  "path": "/Users/alice/ai-project",
  "description": "Tracking Claude API calls and responses"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "abc-123-uuid",
    "name": "AI Agent Logs",
    "path": "/Users/alice/ai-project",
    "description": "Tracking Claude API calls and responses",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### 2. `create_entry`
Add a timestamped log entry to a project. Each entry is immutable once created.

**Parameters:**

| Name | Type | Required | Description |
|---|---|---|---|
| `projectId` | string (UUID) | ✅ | Target project ID |
| `content` | string | ✅ | Log entry text (max 10,000 chars) |

**Example:**

```json
{
  "projectId": "abc-123-uuid",
  "content": "API call to claude-3-opus: prompt_tokens=245, completion_tokens=1203, duration_ms=2150"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "entry-456-uuid",
    "projectId": "abc-123-uuid",
    "content": "API call to claude-3-opus: prompt_tokens=245...",
    "timestamp": "2024-01-15T10:30:45Z",
    "createdAt": "2024-01-15T10:30:45Z"
  }
}
```

---

### 3. `search_entries`
Search and filter entries within a project. Supports keyword search and date range filtering with pagination.

**Parameters:**

| Name | Type | Required | Description |
|---|---|---|---|
| `projectId` | string (UUID) | ✅ | Project ID to search in |
| `keyword` | string | ❌ | Case-insensitive substring match |
| `startDate` | string (ISO 8601) | ❌ | Start of date range (e.g., `2024-01-15T00:00:00Z`) |
| `endDate` | string (ISO 8601) | ❌ | End of date range |
| `page` | number | ❌ | Page number (1-based, default: 1) |
| `limit` | number | ❌ | Results per page (default: 10, max: 100) |

**Example:**

```json
{
  "projectId": "abc-123-uuid",
  "keyword": "error",
  "startDate": "2024-01-10T00:00:00Z",
  "endDate": "2024-01-20T23:59:59Z",
  "page": 1,
  "limit": 20
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "entry-xyz",
        "projectId": "abc-123-uuid",
        "content": "Error: connection timeout after 5s",
        "timestamp": "2024-01-15T14:22:10Z",
        "createdAt": "2024-01-15T14:22:10Z"
      }
    ],
    "total": 3,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

---

## Dashboard & Web Interface

When you run `openlog serve` or `openlog dashboard`, the React dashboard is served at the same port as the API.

**Access points:**

```
http://localhost:3000        ← React Dashboard (SPA)
http://localhost:3000/api    ← REST API (for custom tools)
http://localhost:3000/health ← Health check (JSON)
```

**Dashboard features:**
- **Overview** — total projects, entries, daily streaks, activity heatmap
- **Projects** — create, edit, delete, browse all projects
- **Entries** — full-text search, date range filter, pagination (up to 100 per page)
- **Activity Heatmap** — GitHub-style contribution grid (last 365 days) with stats
- **Dark / Light mode** — toggle in top-right corner
- **Real-time sync** — changes via API appear instantly

**Using the Dashboard:**

1. **Create a project:**
   - Click "New Project" button
   - Enter name, path, optional description
   - Click "Create" — project appears in list

2. **Log an entry:**
   - Click on a project
   - Click "Quick Log" button
   - Select project from dialog (step 1)
   - Type message and click "Log Entry"
   - Entry appears at top of entries list

3. **Search entries:**
   - Go to "Entries" page for a project
   - Use text search to find entries by keyword (case-insensitive substring match)
   - Use date range picker to filter by time period
   - Results show with timestamps and full content

4. **View stats:**
   - Dashboard home shows total projects, entries, streaks
   - Heatmap shows contribution pattern over last year
   - Hover over heatmap days for details

---

## REST API Reference

All responses follow a consistent envelope:

```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Projects

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/projects` | Create project |
| `GET` | `/api/projects` | List projects (paginated) |
| `GET` | `/api/projects/:id` | Get project |
| `PUT` | `/api/projects/:id` | Update project |
| `DELETE` | `/api/projects/:id` | Delete project |

**Examples:**

```bash
# Create a project
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Project",
    "path": "/Users/me/my-app",
    "description": "Logging for my app"
  }'

# List all projects
curl http://localhost:3000/api/projects

# Get a specific project
curl http://localhost:3000/api/projects/abc-123-uuid

# Update a project
curl -X PUT http://localhost:3000/api/projects/abc-123-uuid \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "description": "Updated description"
  }'

# Delete a project (and all its entries)
curl -X DELETE http://localhost:3000/api/projects/abc-123-uuid
```

---

### Entries

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/projects/:id/entries` | Create entry |
| `GET` | `/api/projects/:id/entries` | List entries (filterable) |
| `GET` | `/api/projects/:id/entries/:entryId` | Get entry |
| `PUT` | `/api/projects/:id/entries/:entryId` | Update entry |
| `DELETE` | `/api/projects/:id/entries/:entryId` | Delete entry |

**Query parameters for listing:**

| Parameter | Type | Description |
|---|---|---|
| `keyword` | string | Case-insensitive substring search |
| `startDate` | ISO 8601 | Filter entries after this date |
| `endDate` | ISO 8601 | Filter entries before this date |
| `page` | number | Page number (1-based, default: 1) |
| `limit` | number | Results per page (default: 10, max: 100) |

**Examples:**

```bash
# Create an entry
curl -X POST http://localhost:3000/api/projects/abc-123/entries \
  -H "Content-Type: application/json" \
  -d '{
    "content": "This is a log entry"
  }'

# List all entries in a project
curl http://localhost:3000/api/projects/abc-123/entries

# Search entries by keyword
curl "http://localhost:3000/api/projects/abc-123/entries?keyword=error&limit=20"

# Filter by date range
curl "http://localhost:3000/api/projects/abc-123/entries?startDate=2024-01-10T00:00:00Z&endDate=2024-01-20T23:59:59Z"

# Paginate results
curl "http://localhost:3000/api/projects/abc-123/entries?page=2&limit=50"

# Get a specific entry
curl http://localhost:3000/api/projects/abc-123/entries/entry-456

# Update an entry
curl -X PUT http://localhost:3000/api/projects/abc-123/entries/entry-456 \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Updated log message"
  }'

# Delete an entry
curl -X DELETE http://localhost:3000/api/projects/abc-123/entries/entry-456
```

---

### Images

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/projects/:id/entries/:entryId/image` | Upload image |
| `GET` | `/api/images/:projectId/:filename` | Retrieve image |

**Examples:**

```bash
# Upload an image to an entry
curl -X POST http://localhost:3000/api/projects/abc-123/entries/entry-456/image \
  -F "file=@/path/to/screenshot.png"

# Retrieve an image
curl -o screenshot.png \
  http://localhost:3000/api/images/abc-123/1234567890_screenshot.png
```

---

## Data Storage

All data is stored locally — no cloud, no accounts:

```
~/.openlog/
├── openlog.db          ← SQLite database (WAL mode)
└── images/
    └── {projectId}/
        └── {timestamp}_{filename}
```

Override the base directory:

```bash
OPENLOG_HOME=/custom/path openlog serve
```

---

## Requirements

- **Node.js 24+** (uses built-in `node:sqlite` module)
- npm 7+

---

## Development

```bash
# Clone and install
git clone https://github.com/your-org/openlog.git
cd openlog
npm install

# Start backend + MCP in dev mode (watch)
npm run dev

# Build everything (backend + frontend)
npm run build

# Build backend only
npm run build:backend

# Build frontend only
npm run build:frontend

# Type-check
npm run lint
```

### Project Structure

```
openlog/
├── bin/
│   └── openlog             ← npm binary wrapper (spawns with --experimental-sqlite)
├── src/
│   ├── bootstrap.ts        ← Shared DB init (idempotent)
│   ├── index.ts            ← Combined dev entrypoint (API + MCP)
│   ├── cli/
│   │   └── openlog.ts      ← CLI command parser
│   ├── runtime/
│   │   ├── startApi.ts     ← HTTP API starter
│   │   └── startMcp.ts     ← MCP-only starter
│   ├── server/
│   │   └── app.ts          ← Hono app factory (serves static dashboard)
│   ├── db/                 ← SQLite layer
│   ├── mcp/                ← MCP server and tools
│   ├── routes/             ← API route handlers
│   ├── services/           ← Business logic
│   ├── middleware/         ← Error handling, response formatting
│   ├── schemas/            ← Zod validation schemas
│   ├── types/              ← TypeScript types
│   └── utils/              ← Constants, logger, paths
├── frontend/               ← React + Vite dashboard (source)
├── scripts/
│   └── build-frontend.mjs  ← Builds frontend and copies to dist/public/
└── dist/                   ← Compiled output (generated)
    ├── public/             ← Frontend static assets
    └── ...                 ← Backend JS files
```

---

## Publishing

```bash
# Verify what will be included in the package
npm pack --dry-run

# Publish to npm
npm publish
```

The `prepack` hook automatically runs `npm run build` (backend + frontend) before every pack/publish.

---

## MCP Integration Examples

### How MCP Works

When you add OpenLog as an MCP server, your AI client (Claude, Cursor, Continue, etc.) **automatically loads the three tools** (`create_project`, `create_entry`, `search_entries`) and can invoke them just like any other tool.

The `openlog mcp` command:
1. **Initializes the database** (auto-creates `~/.openlog/` if needed)
2. **Starts a stdio server** that speaks MCP protocol
3. **Stays running** in the background, waiting for tool calls
4. **Returns tool results** as JSON-RPC responses

**All stdout is reserved for MCP protocol** — logging is suppressed automatically.

---

### Claude Desktop

**File:** `~/.claude/claude_desktop_config.json`

If the file doesn't exist, create it:

```json
{
  "mcpServers": {
    "openlog": {
      "command": "npx",
      "args": ["-y", "openlog", "mcp"]
    }
  }
}
```

**Setup:**
1. Add the above config
2. Restart Claude Desktop
3. You'll see an MCP icon in the Claude interface
4. Click to view available tools (you should see OpenLog tools)

**First run:** Claude Desktop may take ~10 seconds to launch the MCP server and detect tools.

---

### Cursor

**File:** `.cursor/mcp.json` (project-local) or `~/.cursor/mcp.json` (global)

```json
{
  "mcpServers": {
    "openlog": {
      "command": "npx",
      "args": ["-y", "openlog", "mcp"]
    }
  }
}
```

**Setup:**
1. Add the config file in your Cursor project or home directory
2. Restart Cursor
3. Tools should be available in the Composer panel

---

### Continue (VS Code)

**File:** `.continue/config.json` (in your project root)

```json
{
  "experimental": {
    "modelContextProtocolServers": [
      {
        "transport": {
          "type": "stdio",
          "command": "npx",
          "args": ["-y", "openlog", "mcp"]
        }
      }
    ]
  }
}
```

**Setup:**
1. Add the config file
2. Restart the Continue extension
3. Tools appear in the Tools menu of the Continue panel

---

### Verifying MCP Tools Are Loaded

Once configured, you can verify the tools are available by:
1. Opening the AI client's tool picker or tools panel
2. Searching for "create_project", "create_entry", or "search_entries"
3. If they appear, MCP is working

**If they don't appear:**
- Check the MCP server logs in your client's console
- Ensure `npx` can run `openlog` (test with `npx openlog --version`)
- Try restarting the entire client (not just the chat window)

---

## Example Workflows

### Workflow 1: Setting Up a Project and Logging

```
User:  I need to track API calls for my AI assistant. Create a project.

Agent: I'll create a new project to track your API calls.
       [Uses create_project tool]
       ✓ Created project "AI API Logs"
       Project ID: 5c9e2a1f-4b3c-11ee-be56-0242ac120002
       
User:  Log this: "Called GPT-4 API, tokens in: 245, tokens out: 1203"

Agent: [Uses create_entry tool]
       ✓ Entry logged with timestamp 2024-01-15T14:22:45Z
       
User:  Show me entries from today that mention "error"

Agent: [Uses search_entries with keyword="error", startDate="2024-01-15T00:00:00Z"]
       Found 2 entries:
         • 14:15:22 — Connection timeout after 5 retries
         • 14:18:10 — Rate limit exceeded (429)
```

### Workflow 2: Debugging with Search

```
User:  Check your logs for any issues in the past hour

Agent: [Uses search_entries with keyword="error", startDate=<1 hour ago>]
       No critical errors found in the past hour.
       
User:  What about warnings?

Agent: [Uses search_entries with keyword="warning", startDate=<1 hour ago>]
       Found 1 warning:
         • 13:45:30 — High memory usage detected (2.1GB/4GB)
```

### Workflow 3: Continuous Logging from a Long Task

```
User:  Process this dataset and log each step

Agent: Setting up logging...
       [Uses create_project]
       ✓ Project "Data Processing" created
       
       Starting processing...
       [Uses create_entry] ✓ Loaded dataset: 50,000 rows
       [Uses create_entry] ✓ Data validation: 98.5% passed
       [Uses create_entry] ✓ Transformation complete: 2 minutes
       [Uses create_entry] ✓ Upload started
       [Uses create_entry] ✓ Upload complete: 3.2 MB in 15 seconds
       
       All steps logged. View the full trace in OpenLog dashboard.
```

---

---

## Troubleshooting

### MCP tools don't appear in my AI client

**Problem:** Added the config but tools aren't showing up.

**Solutions:**
1. **Restart the entire client** — not just the chat window
   - Claude Desktop: Quit and relaunch
   - Cursor: Reload the window (Cmd+R or Ctrl+R)
   - Continue: Restart VS Code

2. **Test the command manually:**
   ```bash
   npx openlog --version   # Should print 1.0.0
   npx openlog mcp         # Should start without errors
   # (Ctrl+C to stop)
   ```

3. **Check the client's MCP server logs:**
   - Claude Desktop: Look in the developer console (View → Toggle Developer Tools)
   - Cursor: Check Output panel for MCP server logs
   - Continue: Check Extension output in VS Code

### Dashboard won't load

**Problem:** `openlog serve` is running but dashboard is blank or shows 404.

**Solutions:**
1. **Check the frontend was built:**
   ```bash
   ls dist/public/index.html
   # Should exist and be >600 bytes
   ```

2. **Rebuild if needed:**
   ```bash
   npm run build:frontend
   ```

3. **Try a different port:**
   ```bash
   openlog serve --port 8080
   ```

### "Cannot find module" or TypeScript errors

**Problem:** Build fails or imports are broken.

**Solutions:**
1. **Reinstall dependencies:**
   ```bash
   npm install
   cd frontend && npm install && cd ..
   ```

2. **Clean rebuild:**
   ```bash
   rm -rf dist/ node_modules/ frontend/node_modules/
   npm install
   npm run build
   ```

### Port already in use

**Problem:** `openlog serve --port 3000` fails with `EADDRINUSE`.

**Solutions:**
1. **Use a different port:**
   ```bash
   openlog serve --port 3010
   ```

2. **Find what's using the port (macOS/Linux):**
   ```bash
   lsof -i :3000
   ```

3. **Kill the process (use with caution):**
   ```bash
   kill -9 <PID>
   ```

### Database is locked or corrupted

**Problem:** Errors mentioning "database locked" or "disk I/O error".

**Solutions:**
1. **Delete and reinitialize:**
   ```bash
   rm -rf ~/.openlog/
   openlog init
   ```

2. **Check disk space:**
   ```bash
   df -h ~
   # Ensure at least 100 MB free
   ```

### Logs are too verbose

**Problem:** `openlog serve` prints too much output.

**Solutions:**
1. **Suppress all logs:**
   ```bash
   OPENLOG_SILENT=1 openlog serve
   ```

2. **Redirect to file:**
   ```bash
   openlog serve > openlog.log 2>&1
   ```

---

## License

GNU Affero General Public License v3.0 (`AGPL-3.0-only`).

If you modify and run this software as a network service, you must make the modified source available under the same license.
