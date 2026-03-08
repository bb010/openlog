import apiClient, { handleApiResponse } from './client';
import type { Project, PaginatedResponse } from '@/types/models';
import type { ApiResponse } from '@/types/api';

export interface CreateProjectData {
  name: string;
  path: string;
  description?: string | null;
}

export interface UpdateProjectData {
  name?: string;
  description?: string | null;
}

/**
 * List all projects with pagination
 */
export async function listProjects(page = 1, limit = 10): Promise<PaginatedResponse<Project>> {
  const response = await apiClient.get<ApiResponse<PaginatedResponse<Project>>>('/api/projects', {
    params: { page, limit },
  });
  return handleApiResponse(response);
}

/**
 * Get a single project by ID
 */
export async function getProject(id: string): Promise<Project> {
  const response = await apiClient.get<ApiResponse<Project>>(`/api/projects/${id}`);
  return handleApiResponse(response);
}

/**
 * Create a new project
 */
export async function createProject(data: CreateProjectData): Promise<Project> {
  const response = await apiClient.post<ApiResponse<Project>>('/api/projects', data);
  return handleApiResponse(response);
}

/**
 * Update an existing project
 */
export async function updateProject(id: string, data: UpdateProjectData): Promise<Project> {
  const response = await apiClient.put<ApiResponse<Project>>(`/api/projects/${id}`, data);
  return handleApiResponse(response);
}

/**
 * Delete a project (cascades to entries)
 */
export async function deleteProject(id: string): Promise<void> {
  const response = await apiClient.delete<ApiResponse<{ deleted: boolean }>>(`/api/projects/${id}`);
  handleApiResponse(response);
}
