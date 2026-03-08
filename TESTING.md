# OpenLog Testing Guide

This guide covers how to test both the backend API and the MCP server integration.

## Prerequisites

- Node.js 24+
- npm
- A REST client (curl, Postman, or Thunder Client)
- Claude Desktop (optional, for MCP testing)

## 1. Backend API Testing

### Start the Development Server

```bash
npm run dev
```

The server will start at `http://localhost:3000` with the HTTP API and MCP server both running.

### Health Check

Verify the server is running:

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Test Project Endpoints

#### 1. Create a Project

```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My First Project",
    "description": "Testing the OpenLog API",
    "status": "active"
  }'
```

Response (save the `id` for next tests):
```json
{
  "success": true,
  "data": {
    "id": "proj_1234567890",
    "name": "My First Project",
    "description": "Testing the OpenLog API",
    "status": "active",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "error": null,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### 2. List Projects

```bash
curl http://localhost:3000/api/projects
```

#### 3. Get a Specific Project

```bash
curl http://localhost:3000/api/projects/{projectId}
```

Replace `{projectId}` with the ID from step 1.

#### 4. Update a Project

```bash
curl -X PUT http://localhost:3000/api/projects/{projectId} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Project Name",
    "status": "completed"
  }'
```

#### 5. Delete a Project

```bash
curl -X DELETE http://localhost:3000/api/projects/{projectId}
```

### Test Entry Endpoints

#### 1. Create an Entry

```bash
curl -X POST http://localhost:3000/api/projects/{projectId}/entries \
  -H "Content-Type: application/json" \
  -d '{
    "title": "First Entry",
    "description": "Testing entry creation",
    "status": "completed",
    "tags": ["testing", "api"]
  }'
```

Save the entry `id` for next tests.

#### 2. List Entries with Filtering

```bash
# List all entries for a project
curl http://localhost:3000/api/projects/{projectId}/entries

# Filter by status
curl "http://localhost:3000/api/projects/{projectId}/entries?status=completed"

# Filter by date range
curl "http://localhost:3000/api/projects/{projectId}/entries?startDate=2024-01-01&endDate=2024-01-31"

# Search by tag
curl "http://localhost:3000/api/projects/{projectId}/entries?tags=testing"

# Pagination
curl "http://localhost:3000/api/projects/{projectId}/entries?page=1&limit=10"
```

#### 3. Get a Specific Entry

```bash
curl http://localhost:3000/api/projects/{projectId}/entries/{entryId}
```

#### 4. Update an Entry

```bash
curl -X PUT http://localhost:3000/api/projects/{projectId}/entries/{entryId} \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Entry Title",
    "status": "in-progress",
    "tags": ["updated", "testing"]
  }'
```

#### 5. Delete an Entry

```bash
curl -X DELETE http://localhost:3000/api/projects/{projectId}/entries/{entryId}
```

### Test Image Upload

#### 1. Upload an Image

```bash
# Create a test image (1x1 red pixel PNG)
curl -X POST http://localhost:3000/api/projects/{projectId}/entries/{entryId}/image \
  -F "image=@/path/to/image.png"
```

For testing without an actual image, you can use the bash one-liner to create a dummy file:

```bash
# Create a dummy text file to test upload
echo "test image data" > /tmp/test-image.txt

curl -X POST http://localhost:3000/api/projects/{projectId}/entries/{entryId}/image \
  -F "image=@/tmp/test-image.txt"
```

#### 2. Retrieve an Image

```bash
curl http://localhost:3000/api/images/{projectId}/{filename}
```

You'll need the filename returned from the upload endpoint.

### Test Dashboard Statistics

```bash
curl http://localhost:3000/api/dashboard/statistics
```

Expected response:
```json
{
  "success": true,
  "data": {
    "totalProjects": 5,
    "activeProjects": 3,
    "totalEntries": 42,
    "completedEntries": 30,
    "recentEntries": [
      {
        "id": "entry_xxx",
        "title": "Entry Title",
        "projectId": "proj_xxx",
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ]
  },
  "error": null,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 2. MCP Server Testing

### Overview

The MCP (Model Context Protocol) server runs on stdio and can be used by Claude Desktop to access OpenLog tools.

### Quick Test

While the development server is running, you can test that the MCP server initializes correctly by checking the logs:

```bash
# You should see in the console output:
# [INFO] MCP Server started (stdio transport) — tools: create_project, create_entry, search_entries
```

### Connect to Claude Desktop

1. **Get the absolute path to your project:**

```bash
pwd
# Output: /Users/bharatbhora/Documents/Invoke/openlog/sandbox_1772872552894
```

2. **Update Claude Desktop config** at `~/.claude/claude_desktop_config.json`:

For development (TypeScript source):
```json
{
  "mcpServers": {
    "openlog": {
      "command": "npx",
      "args": ["tsx", "/Users/bharatbhora/Documents/Invoke/openlog/sandbox_1772872552894/src/index.ts"]
    }
  }
}
```

Or for production (compiled build):
```json
{
  "mcpServers": {
    "openlog": {
      "command": "npm",
      "args": ["start"],
      "cwd": "/Users/bharatbhora/Documents/Invoke/openlog/sandbox_1772872552894"
    }
  }
}
```

3. **Restart Claude Desktop** to load the new config

4. **Test the connection** - In Claude, you should see the OpenLog tools available and can use them like:

```
"Create a new project called 'My AI Project'"
"Add an entry to project XYZ with the title 'Progress Update'"
"Search for all entries with tag 'important'"
```

## 3. Automated Testing Script

Create a test script to run through all major endpoints:

```bash
# Save as: test-api.sh

#!/bin/bash

BASE_URL="http://localhost:3000"

echo "🧪 OpenLog API Testing"
echo "====================="

# Health check
echo -e "\n✓ Health Check"
curl -s $BASE_URL/health | jq .

# Create project
echo -e "\n✓ Creating Project"
PROJECT=$(curl -s -X POST $BASE_URL/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Project","description":"API Test","status":"active"}')
PROJECT_ID=$(echo $PROJECT | jq -r '.data.id')
echo $PROJECT | jq .
echo "Project ID: $PROJECT_ID"

# List projects
echo -e "\n✓ Listing Projects"
curl -s $BASE_URL/api/projects | jq .

# Create entry
echo -e "\n✓ Creating Entry"
ENTRY=$(curl -s -X POST $BASE_URL/api/projects/$PROJECT_ID/entries \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Entry","description":"Testing","status":"completed","tags":["test"]}')
ENTRY_ID=$(echo $ENTRY | jq -r '.data.id')
echo $ENTRY | jq .
echo "Entry ID: $ENTRY_ID"

# List entries
echo -e "\n✓ Listing Entries"
curl -s $BASE_URL/api/projects/$PROJECT_ID/entries | jq .

# Dashboard stats
echo -e "\n✓ Dashboard Statistics"
curl -s $BASE_URL/api/dashboard/statistics | jq .

# Cleanup
echo -e "\n✓ Cleanup"
curl -s -X DELETE $BASE_URL/api/projects/$PROJECT_ID/entries/$ENTRY_ID | jq .
curl -s -X DELETE $BASE_URL/api/projects/$PROJECT_ID | jq .

echo -e "\n✅ All tests completed!"
```

Run it with:
```bash
chmod +x test-api.sh
./test-api.sh
```

## 4. Database Inspection

The SQLite database is stored at `~/.openlog/openlog.db`.

To inspect it directly:

```bash
# Install sqlite3 CLI if needed (macOS)
brew install sqlite3

# Open the database
sqlite3 ~/.openlog/openlog.db

# Common queries:
.tables
SELECT COUNT(*) FROM projects;
SELECT COUNT(*) FROM entries;
SELECT * FROM projects;
SELECT * FROM entries LIMIT 5;
.quit
```

## 5. Troubleshooting

### Port Already in Use

If port 3000 is already in use:

```bash
# Use a different port
PORT=3001 npm run dev

# Then test with:
curl http://localhost:3001/health
```

### Database Lock

If you see "database is locked" errors:

```bash
# The database may be held by another process
# Either restart the server or:
rm ~/.openlog/openlog.db
npm run dev
```

### MCP Server Not Starting

Check the logs:
```bash
# You should see one of these in the console:
# [INFO] MCP Server started (stdio transport) — tools: create_project, create_entry, search_entries
# [ERROR] Failed to start MCP server
```

If you see an error, check that:
1. Node.js 24+ is installed: `node --version`
2. Dependencies are installed: `npm install`
3. TypeScript compiles: `npm run lint`

### Image Upload Issues

The `~/.openlog/images` directory must exist. If images fail to upload:

```bash
mkdir -p ~/.openlog/images
npm run dev
```

## 6. Performance Testing

### Load Testing with Apache Bench

```bash
# Test creating multiple projects (10 concurrent, 100 total)
ab -n 100 -c 10 -p project.json \
  -T "application/json" \
  http://localhost:3000/api/projects
```

Where `project.json` contains:
```json
{
  "name": "Load Test Project",
  "description": "Performance testing",
  "status": "active"
}
```

## Summary

- **API Testing**: Use curl or Postman to test endpoints (start with health check)
- **MCP Testing**: Connect Claude Desktop using the config example
- **Database**: Inspect with sqlite3 CLI if needed
- **Debugging**: Check logs from `npm run dev` for errors

Happy testing! 🎉
