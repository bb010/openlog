import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerTools } from './tools.js';
import { logger } from '../utils/logger.js';

let mcpServer: McpServer | null = null;

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * OPENLOG MCP SERVER
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * OpenLog is a structured logging and project management system designed for:
 * - Recording and organizing timestamped log entries
 * - Managing projects for grouping related logs (CI/CD, deployments, training runs)
 * - Advanced searching and filtering (date ranges, keywords, pagination)
 * - Integration with AI agents (Claude, etc.) via Model Context Protocol
 *
 * TOOLS PROVIDED:
 * 1. create_project
 *    Create a new project to organize logs. Projects act as containers for
 *    related log entries (e.g., CI/CD pipeline, deployment events, training progress).
 *    Required: name (unique, 1–255 chars), path (file system reference)
 *    Optional: description (max 1,000 chars)
 *
 * 2. create_entry
 *    Add a timestamped log entry to an existing project. Each entry is
 *    automatically timestamped and can contain build outputs, status updates,
 *    errors, or any structured log data.
 *    Required: projectId (UUID), content (text of the log)
 *
 * 3. search_entries
 *    Search and filter log entries within a project. Supports keyword search
 *    (case-insensitive), date range filtering (ISO 8601), and pagination.
 *    Required: projectId (UUID)
 *    Optional: keyword, startDate, endDate, page (1-based), limit (default 10)
 *
 * USE CASES:
 * - Log CI/CD pipeline events from GitHub Actions, GitLab CI, or other systems
 * - Track deployment progress and status to production/staging environments
 * - Record AI training progress (loss, accuracy, iteration counts)
 * - Monitor automated backup jobs and health checks
 * - Aggregate logs from multiple sources into a unified interface
 * - Analyze historical trends and audit event history
 *
 * ARCHITECTURE:
 * - Runs in the same Node.js process as the Hono HTTP API
 * - Shares the same SQLite database via the service layer
 * - Uses stdio transport for MCP protocol communication
 * - HTTP API and MCP server are independent (both always running)
 *
 * TRANSPORT: STDIO
 * - When spawned by an MCP client (Claude Desktop, etc.), stdin/stdout are
 *   redirected to the client, enabling bidirectional protocol communication
 * - The HTTP API continues listening on its configured port independently
 * - In normal terminal usage, the MCP server idles on stdin without issues
 *
 * SETUP FOR CLAUDE DESKTOP (~/.claude/claude_desktop_config.json):
 *
 * For development (TypeScript source with tsx):
 * {
 *   "mcpServers": {
 *     "openlog": {
 *       "command": "npx",
 *       "args": ["tsx", "/absolute/path/to/openlog/src/index.ts"]
 *     }
 *   }
 * }
 *
 * For production (compiled JavaScript):
 * {
 *   "mcpServers": {
 *     "openlog": {
 *       "command": "npm",
 *       "args": ["start"],
 *       "cwd": "/absolute/path/to/openlog"
 *     }
 *   }
 * }
 *
 * After updating the config, restart Claude Desktop. You'll then be able to
 * use OpenLog tools directly from Claude conversations.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */
export async function initializeMcpServer(): Promise<void> {
  const server = new McpServer({
    name: 'openlog',
    version: '1.0.0',
  });

  // Register all OpenLog tools with the server
  registerTools(server);

  // Connect using the stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  mcpServer = server;

  logger.info('MCP Server started (stdio transport) — tools: create_project, create_entry, search_entries');
}

/**
 * Gracefully shuts down the MCP server if it was started.
 */
export async function closeMcpServer(): Promise<void> {
  if (mcpServer) {
    await mcpServer.close();
    mcpServer = null;
    logger.info('MCP Server closed');
  }
}
