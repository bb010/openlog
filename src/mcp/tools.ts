import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as projectService from '../services/projectService.js';
import * as entryService from '../services/entryService.js';
import { PAGINATION } from '../utils/constants.js';
import { toMcpError } from './errors.js';

/**
 * Registers all OpenLog MCP tools on the given McpServer instance.
 *
 * OpenLog is a structured logging and project management system. Use these tools to:
 * - Create and manage projects for organizing related logs and entries
 * - Add log entries to projects with timestamps and metadata
 * - Search and filter log entries by date range, keywords, and other criteria
 *
 * Tools registered:
 *  - create_project  : Create a new OpenLog project for organizing logs
 *  - create_entry    : Append a timestamped log entry to an existing project
 *  - search_entries  : Search / list / filter log entries in a project
 */
export function registerTools(server: McpServer): void {
  // ─── create_project ────────────────────────────────────────────────────────
  /**
   * Creates a new project in OpenLog.
   *
   * @param name        - Human-readable project name (1–255 chars, must be unique)
   * @param path        - File-system path associated with the project
   * @param description - Optional description (max 1 000 chars)
   *
   * Returns the newly created project on success, or a structured error object
   * with one of the following codes:
   *  - DUPLICATE_PROJECT  : a project with that name already exists
   *  - VALIDATION_ERROR   : input failed schema validation
   *  - INTERNAL_ERROR     : unexpected server error
   */
  server.registerTool(
    'create_project',
    {
      description:
        'Create a new OpenLog project to organize and manage log entries. Projects serve as containers for grouping related logs, build outputs, deployment records, or any timestamped events. Each project has a unique name, file-system path, and optional description. Use this to set up a new project before adding log entries. Example use cases: organize CI/CD pipeline logs, track deployment events, record AI training progress.',
      inputSchema: z.object({
        name: z
          .string()
          .min(1, 'Project name is required')
          .max(255, 'Project name must be less than 255 characters')
          .describe('Unique, human-readable project name (1–255 characters). Examples: "My Build Pipeline", "Production Deployments", "AI Training Runs".'),
        path: z
          .string()
          .min(1, 'Project path is required')
          .describe('File-system path associated with the project (e.g., "/home/user/projects/my-app"). Used for organizational and reference purposes.'),
        description: z
          .string()
          .max(1000, 'Description must be less than 1000 characters')
          .nullish()
          .describe('Optional description explaining the project purpose (max 1,000 characters). Examples: "GitHub Actions CI/CD logs", "Daily automated backups".'),
      }),
    },
    async ({ name, path, description }) => {
      try {
        const project = projectService.createProject({ name, path, description });
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, project }),
            },
          ],
        };
      } catch (err) {
        const error = toMcpError(err);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: false, error }),
            },
          ],
        };
      }
    }
  );

  // ─── create_entry ──────────────────────────────────────────────────────────
  /**
   * Creates a new log entry in an existing OpenLog project.
   *
   * @param projectId - UUID of the target project
   * @param content   - Text content of the log entry (min 1 char)
   *
   * Returns the newly created entry on success, or a structured error object
   * with one of the following codes:
   *  - PROJECT_NOT_FOUND  : no project exists with the given projectId
   *  - VALIDATION_ERROR   : input failed schema validation
   *  - INTERNAL_ERROR     : unexpected server error
   */
  server.registerTool(
    'create_entry',
    {
      description:
        'Add a new timestamped log entry to an existing OpenLog project. Entries capture specific events, outputs, or status updates with automatic timestamps. Use this to record build results, deployment statuses, error messages, training progress, or any structured log data. Perfect for logging CI/CD pipelines, AI training runs, deployment events, or daily automated tasks.',
      inputSchema: z.object({
        projectId: z
          .string()
          .uuid('projectId must be a valid UUID')
          .describe('UUID identifier of the target project where the entry will be created.'),
        content: z
          .string()
          .min(1, 'Content is required')
          .describe('The log entry content (text). Examples: "Build succeeded with 0 warnings", "Deployment completed", "Training iteration 42: loss=0.123, accuracy=0.95".'),
      }),
    },
    async ({ projectId, content }) => {
      try {
        const entry = entryService.createEntry(projectId, { content });
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, entry }),
            },
          ],
        };
      } catch (err) {
        const error = toMcpError(err);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: false, error }),
            },
          ],
        };
      }
    }
  );

  // ─── search_entries ────────────────────────────────────────────────────────
  /**
   * Searches or lists log entries in an OpenLog project.
   *
   * @param projectId - UUID of the project to search
   * @param keyword   - Optional keyword to match against entry content (substring, case-insensitive)
   * @param startDate - Optional ISO 8601 start of date range (inclusive)
   * @param endDate   - Optional ISO 8601 end of date range (inclusive)
   * @param page      - Page number (1-based, default 1)
   * @param limit     - Number of results per page (default 10, max 100)
   *
   * Returns a paginated result set on success, or a structured error object
   * with one of the following codes:
   *  - PROJECT_NOT_FOUND  : no project exists with the given projectId
   *  - VALIDATION_ERROR   : invalid date format or pagination parameters
   *  - INTERNAL_ERROR     : unexpected server error
   */
  server.registerTool(
    'search_entries',
    {
      description:
        'Search, filter, and list log entries from an OpenLog project. Retrieve all entries or narrow results using keyword search (case-insensitive substring matching), date range filtering (ISO 8601 format), and pagination. Use this to find specific logs, analyze trends over time, or retrieve recent activity. Supports powerful filtering combinations: find all "error" entries from the last week, list "completed" entries from a specific date, or search for keywords in large datasets.',
      inputSchema: z.object({
        projectId: z
          .string()
          .uuid('projectId must be a valid UUID')
          .describe('UUID identifier of the project to search within.'),
        keyword: z
          .string()
          .max(255)
          .optional()
          .describe('Optional keyword to search within entry content (case-insensitive substring match). Examples: "error", "warning", "completed", "failed".'),
        startDate: z
          .string()
          .datetime({ message: 'startDate must be a valid ISO 8601 datetime' })
          .optional()
          .describe('Optional ISO 8601 datetime (e.g., "2024-01-15T10:30:00Z"). Only entries at or after this time are returned.'),
        endDate: z
          .string()
          .datetime({ message: 'endDate must be a valid ISO 8601 datetime' })
          .optional()
          .describe('Optional ISO 8601 datetime (e.g., "2024-01-15T23:59:59Z"). Only entries at or before this time are returned.'),
        page: z
          .number()
          .int()
          .min(1, 'page must be at least 1')
          .default(PAGINATION.DEFAULT_PAGE)
          .describe('Page number for pagination (1-based, default 1). Navigate through large result sets.'),
        limit: z
          .number()
          .int()
          .min(1)
          .max(PAGINATION.MAX_LIMIT, `limit must be at most ${PAGINATION.MAX_LIMIT}`)
          .default(PAGINATION.DEFAULT_LIMIT)
          .describe(`Number of results per page (default ${PAGINATION.DEFAULT_LIMIT}, max ${PAGINATION.MAX_LIMIT}).`),
      }),
    },
    async ({ projectId, keyword, startDate, endDate, page, limit }) => {
      try {
        const results = entryService.listEntries(projectId, {
          page,
          limit,
          keyword,
          startDate,
          endDate,
        });
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, results }),
            },
          ],
        };
      } catch (err) {
        const error = toMcpError(err);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: false, error }),
            },
          ],
        };
      }
    }
  );
}
