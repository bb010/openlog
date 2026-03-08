import apiClient, { handleApiResponse } from './client';
import type { LogEntry, PaginatedResponse, EntryFilters } from '@/types/models';
import type { ApiResponse } from '@/types/api';

export interface CreateEntryData {
  content: string;
}

export interface UpdateEntryData {
  content?: string;
}

/**
 * List entries for a project with filters and pagination
 */
export async function listEntries(
  projectId: string,
  filters: Partial<EntryFilters> = {}
): Promise<PaginatedResponse<LogEntry>> {
  const response = await apiClient.get<ApiResponse<PaginatedResponse<LogEntry>>>(
    `/api/projects/${projectId}/entries`,
    { params: filters }
  );
  return handleApiResponse(response);
}

/**
 * Get a single entry by ID
 */
export async function getEntry(projectId: string, entryId: string): Promise<LogEntry> {
  const response = await apiClient.get<ApiResponse<LogEntry>>(
    `/api/projects/${projectId}/entries/${entryId}`
  );
  return handleApiResponse(response);
}

/**
 * Create a new log entry
 */
export async function createEntry(projectId: string, data: CreateEntryData): Promise<LogEntry> {
  const response = await apiClient.post<ApiResponse<LogEntry>>(
    `/api/projects/${projectId}/entries`,
    data
  );
  return handleApiResponse(response);
}

/**
 * Update a log entry
 */
export async function updateEntry(
  projectId: string,
  entryId: string,
  data: UpdateEntryData
): Promise<LogEntry> {
  const response = await apiClient.put<ApiResponse<LogEntry>>(
    `/api/projects/${projectId}/entries/${entryId}`,
    data
  );
  return handleApiResponse(response);
}

/**
 * Delete a log entry
 */
export async function deleteEntry(projectId: string, entryId: string): Promise<void> {
  const response = await apiClient.delete<ApiResponse<{ deleted: boolean }>>(
    `/api/projects/${projectId}/entries/${entryId}`
  );
  handleApiResponse(response);
}

/**
 * Upload an image to a log entry
 */
export async function uploadImage(
  projectId: string,
  entryId: string,
  file: File
): Promise<LogEntry> {
  const formData = new FormData();
  formData.append('image', file);

  const response = await apiClient.post<ApiResponse<LogEntry>>(
    `/api/projects/${projectId}/entries/${entryId}/image`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );
  return handleApiResponse(response);
}
