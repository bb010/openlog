import type { Project, LogEntry, PaginatedResponse } from '../types/models.js';

// ─── Tool Input Types ────────────────────────────────────────────────────────

export interface CreateProjectInput {
  name: string;
  path: string;
  description?: string | null;
}

export interface CreateEntryInput {
  projectId: string;
  content: string;
}

export interface SearchEntriesInput {
  projectId: string;
  keyword?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// ─── Tool Output Types ───────────────────────────────────────────────────────

export interface McpErrorPayload {
  code: string;
  message: string;
}

export interface CreateProjectOutput {
  success: boolean;
  project?: Project;
  error?: McpErrorPayload;
}

export interface CreateEntryOutput {
  success: boolean;
  entry?: LogEntry;
  error?: McpErrorPayload;
}

export interface SearchEntriesOutput {
  success: boolean;
  results?: PaginatedResponse<LogEntry>;
  error?: McpErrorPayload;
}
