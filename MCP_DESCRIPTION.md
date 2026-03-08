# OpenLog MCP Server Documentation

## Overview

**OpenLog** is a structured logging and project management system with full **Model Context Protocol (MCP)** integration. It's designed to help AI agents (Claude, other LLMs) organize, log, and analyze timestamped events from any source.

## What is OpenLog?

OpenLog provides:

1. **Project Management** - Create projects to organize related logs
2. **Log Entry Recording** - Add timestamped entries with full-text content
3. **Advanced Filtering** - Search by keywords, date ranges, and pagination
4. **AI Integration** - Use MCP tools directly from Claude Desktop or other MCP clients

## MCP Tools Available

### 1. `create_project`

**Purpose:** Create a new project to organize log entries

**What it does:**
- Creates a new project container for organizing related logs
- Projects serve as categories for grouping related timestamped events
- Each project has a unique name, file-system path, and optional description

**Use cases:**
- Set up a "CI/CD Pipeline" project for GitHub Actions logs
- Create a "Production Deployments" project for tracking deploys
- Make an "AI Training Runs" project for ML experiment logs
- Organize "Daily Backups" project for backup status records

**Parameters:**
- `name` (required): Unique project name (1–255 characters)
  - Examples: "My Build Pipeline", "Production Deployments", "AI Training Runs"
- `path` (required): File-system path reference (e.g., "/home/user/projects/my-app")
- `description` (optional): Project description explaining its purpose (max 1,000 chars)
  - Examples: "GitHub Actions CI/CD logs", "Daily automated backup status"

**Example in Claude:**
```
Create a new OpenLog project called "My Build Pipeline" at path "/home/user/my-app" 
with description "Logs from GitHub Actions CI/CD"
```

---

### 2. `create_entry`

**Purpose:** Add a timestamped log entry to a project

**What it does:**
- Adds a new log entry with automatic timestamp to an existing project
- Each entry captures a specific event, output, or status update
- Entries are immutable and searchable by date range and keywords

**Use cases:**
- Log "Build succeeded with 0 warnings" to track CI pipeline results
- Record "Deployment to production completed in 2 minutes 15 seconds"
- Store "Training iteration 42: loss=0.123, accuracy=0.95" for ML tracking
- Save "Backup completed: 250GB in 45 minutes, 0 errors"

**Parameters:**
- `projectId` (required): UUID of the target project
- `content` (required): The log entry text
  - Can be any text: build output, status update, error message, metric summary

**Example in Claude:**
```
Add an entry to my Build Pipeline project with content "Build succeeded: 
all tests passed, code coverage 95%, deployment ready"
```

---

### 3. `search_entries`

**Purpose:** Search and filter log entries within a project

**What it does:**
- Retrieves log entries from a project with powerful filtering options
- Supports keyword search (case-insensitive substring matching)
- Filters by date range (ISO 8601 format)
- Handles pagination for large result sets

**Use cases:**
- Find all "error" entries from the last week
- List "completed" entries from a specific date range
- Search for "deployment" keywords across a project's history
- Analyze trends: "Show me all 'loss' entries to track training progress"
- Retrieve recent entries: "Get the last 10 log entries from this project"

**Parameters:**
- `projectId` (required): UUID of the project to search
- `keyword` (optional): Search term (case-insensitive substring match)
  - Examples: "error", "warning", "completed", "failed", "success"
- `startDate` (optional): ISO 8601 datetime (e.g., "2024-01-15T10:30:00Z")
  - Returns entries at or after this time
- `endDate` (optional): ISO 8601 datetime (e.g., "2024-01-15T23:59:59Z")
  - Returns entries at or before this time
- `page` (optional): Page number for pagination (1-based, default 1)
- `limit` (optional): Results per page (default 10, max 100)

**Example in Claude:**
```
Search for all entries containing "error" in my Build Pipeline project 
from January 15 to January 31, 2024
```

---

## Real-World Examples

### Example 1: CI/CD Pipeline Logging

```
1. Create project: "CI/CD Pipeline" at "/home/user/github-actions"
2. Each time a build completes, add entry: "Build #123: SUCCESS, time=2m 15s"
3. Later, search: Find all "FAILURE" entries from the past week
4. Analyze: Which builds failed? How often? When are they happening?
```

### Example 2: Deployment Tracking

```
1. Create project: "Production Deployments"
2. After each deploy, log: "Deployed v2.1.0 to prod: 50ms latency, 0 errors"
3. Search: "Find all deployments from the last month"
4. Track: "Show me deployments that mentioned 'rollback'"
```

### Example 3: AI Training Progress

```
1. Create project: "Model Training Run #42"
2. After each epoch, log: "Epoch 50: loss=0.245, accuracy=0.92, lr=0.001"
3. Search: "Get all entries from this training run with loss values"
4. Analyze: "Show me the trend over 100 entries to see convergence"
```

### Example 4: Automated Backup Monitoring

```
1. Create project: "Daily Backups"
2. After each backup, log: "Backup 2024-01-15: 500GB in 2h 30m, 0 errors"
3. Search: "Find any backups that took longer than 3 hours"
4. Alert: "Show me backups from the past week with errors"
```

---

## Integration with Claude Desktop

### Setup Steps

1. **Get your OpenLog path:**
   ```bash
   pwd
   # Output: /Users/yourname/Documents/Invoke/openlog/sandbox_1772872552894
   ```

2. **Edit Claude Desktop config** at `~/.claude/claude_desktop_config.json`:

   For development (TypeScript source):
   ```json
   {
     "mcpServers": {
       "openlog": {
         "command": "npx",
         "args": ["tsx", "/Users/yourname/Documents/Invoke/openlog/sandbox_1772872552894/src/index.ts"]
       }
     }
   }
   ```

   For production (compiled build):
   ```json
   {
     "mcpServers": {
       "openlog": {
         "command": "npm",
         "args": ["start"],
         "cwd": "/Users/yourname/Documents/Invoke/openlog/sandbox_1772872552894"
       }
     }
   }
   ```

3. **Restart Claude Desktop** - The tools will appear in the system prompt

4. **Start using it:**
   - "Create a new OpenLog project for tracking my AI experiments"
   - "Log the latest training metrics to my project"
   - "Search my project for entries containing 'error' from the past week"

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                   Claude Desktop                        │
│              (MCP Client - Optional)                    │
└──────────────────────┬──────────────────────────────────┘
                       │ MCP Protocol (stdio)
                       │
┌──────────────────────▼──────────────────────────────────┐
│            OpenLog HTTP + MCP Server                    │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │         HTTP API (Port 3000)                       │ │
│  │  - Projects endpoints                              │ │
│  │  - Entries endpoints                               │ │
│  │  - Dashboard statistics                            │ │
│  │  - Image upload/retrieval                          │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │         MCP Server (stdio transport)               │ │
│  │  - create_project tool                             │ │
│  │  - create_entry tool                               │ │
│  │  - search_entries tool                             │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │    Shared SQLite Database (~/.openlog/openlog.db) │ │
│  │  - projects table                                  │ │
│  │  - entries table                                   │ │
│  │  - Full-text search support                        │ │
│  └────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

---

## Technology Stack

- **Runtime:** Node.js 24+ (built-in SQLite support)
- **HTTP Framework:** Hono (fast, minimal)
- **Protocol:** Model Context Protocol (MCP) via stdio
- **Database:** SQLite (single file, no setup required)
- **Validation:** Zod (type-safe schema validation)
- **Language:** TypeScript

---

## Getting Started

### Prerequisites

- Node.js 24+
- npm

### Development

```bash
# Clone and install
cd /Users/bharatbhora/Documents/Invoke/openlog/sandbox_1772872552894
npm install

# Start development server (HTTP API + MCP server)
npm run dev

# You should see:
# [INFO] Starting OpenLog HTTP server on port 3000
# [INFO] OpenLog HTTP API is running at http://localhost:3000
# [INFO] MCP Server started (stdio transport) — tools: create_project, create_entry, search_entries
```

### Quick Test (curl)

```bash
# Health check
curl http://localhost:3000/health

# Create a project
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Project","path":"/tmp/test","description":"Testing OpenLog"}'

# Create an entry (replace {projectId} with ID from above)
curl -X POST http://localhost:3000/api/projects/{projectId}/entries \
  -H "Content-Type: application/json" \
  -d '{"title":"Entry 1","content":"Testing entry creation","status":"completed"}'

# Search entries
curl http://localhost:3000/api/projects/{projectId}/entries
```

---

## Support & Documentation

- **Testing Guide:** See `TESTING.md` for comprehensive API and MCP testing
- **Backend README:** See `README.md` for API endpoint reference
- **Source Code:** Located in `src/` directory with detailed comments

---

## Summary

OpenLog empowers AI agents to:
- ✅ Create organized project structures for logs
- ✅ Record and store timestamped events automatically
- ✅ Search and filter entries intelligently
- ✅ Integrate seamlessly with Claude and other LLM agents
- ✅ Build powerful automation workflows with full logging capabilities

**Start by creating your first project and exploring what you can build!** 🚀
