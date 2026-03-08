import {
  createEntry as dbCreateEntry,
  getEntryByIdAndProject,
  listEntriesByProject as dbListEntries,
  updateEntry as dbUpdateEntry,
  deleteEntry as dbDeleteEntry,
} from '../db/entries.js';
import { getProjectById } from '../db/projects.js';
import type { LogEntry, PaginatedResponse } from '../types/models.js';
import type { CreateEntry, UpdateEntry, EntryFilters } from '../schemas/entry.js';
import { AppError } from '../middleware/errorHandler.js';
import { ERROR_CODES, PAGINATION } from '../utils/constants.js';
import { deleteImage } from './imageService.js';

export function createEntry(projectId: string, input: CreateEntry): LogEntry {
  const project = getProjectById(projectId);
  if (!project) {
    throw new AppError(
      ERROR_CODES.PROJECT_NOT_FOUND,
      `Project with id "${projectId}" not found`,
      404
    );
  }

  return dbCreateEntry({ projectId, content: input.content });
}

export function getEntry(projectId: string, entryId: string): LogEntry {
  const project = getProjectById(projectId);
  if (!project) {
    throw new AppError(
      ERROR_CODES.PROJECT_NOT_FOUND,
      `Project with id "${projectId}" not found`,
      404
    );
  }

  const entry = getEntryByIdAndProject(entryId, projectId);
  if (!entry) {
    throw new AppError(
      ERROR_CODES.ENTRY_NOT_FOUND,
      `Entry with id "${entryId}" not found in project "${projectId}"`,
      404
    );
  }

  return entry;
}

export function listEntries(
  projectId: string,
  filters: EntryFilters
): PaginatedResponse<LogEntry> {
  const project = getProjectById(projectId);
  if (!project) {
    throw new AppError(
      ERROR_CODES.PROJECT_NOT_FOUND,
      `Project with id "${projectId}" not found`,
      404
    );
  }

  const limit = Math.min(filters.limit, PAGINATION.MAX_LIMIT);
  const page = filters.page;
  const offset = (page - 1) * limit;

  const { items, total } = dbListEntries(projectId, limit, offset, {
    startDate: filters.startDate,
    endDate: filters.endDate,
    keyword: filters.keyword,
  });

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export function updateEntry(
  projectId: string,
  entryId: string,
  updates: UpdateEntry
): LogEntry {
  const project = getProjectById(projectId);
  if (!project) {
    throw new AppError(
      ERROR_CODES.PROJECT_NOT_FOUND,
      `Project with id "${projectId}" not found`,
      404
    );
  }

  const existing = getEntryByIdAndProject(entryId, projectId);
  if (!existing) {
    throw new AppError(
      ERROR_CODES.ENTRY_NOT_FOUND,
      `Entry with id "${entryId}" not found in project "${projectId}"`,
      404
    );
  }

  const updated = dbUpdateEntry(entryId, updates);
  return updated!;
}

export function attachImageToEntry(
  projectId: string,
  entryId: string,
  imagePath: string
): LogEntry {
  const project = getProjectById(projectId);
  if (!project) {
    throw new AppError(
      ERROR_CODES.PROJECT_NOT_FOUND,
      `Project with id "${projectId}" not found`,
      404
    );
  }

  const existing = getEntryByIdAndProject(entryId, projectId);
  if (!existing) {
    throw new AppError(
      ERROR_CODES.ENTRY_NOT_FOUND,
      `Entry with id "${entryId}" not found in project "${projectId}"`,
      404
    );
  }

  // Delete old image if it exists
  if (existing.imagePath) {
    deleteImage(existing.imagePath);
  }

  const updated = dbUpdateEntry(entryId, { imagePath });
  return updated!;
}

export function deleteEntry(projectId: string, entryId: string): void {
  const project = getProjectById(projectId);
  if (!project) {
    throw new AppError(
      ERROR_CODES.PROJECT_NOT_FOUND,
      `Project with id "${projectId}" not found`,
      404
    );
  }

  const existing = getEntryByIdAndProject(entryId, projectId);
  if (!existing) {
    throw new AppError(
      ERROR_CODES.ENTRY_NOT_FOUND,
      `Entry with id "${entryId}" not found in project "${projectId}"`,
      404
    );
  }

  // Delete associated image from disk
  if (existing.imagePath) {
    deleteImage(existing.imagePath);
  }

  dbDeleteEntry(entryId);
}
