import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as projectsApi from '@/api/projectsApi';
import { useToast } from './useToast';
import { parseApiError } from '@/utils/errors';

// Query keys
export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (page: number, limit: number) => [...projectKeys.lists(), { page, limit }] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
};

/**
 * Hook to fetch paginated list of projects
 */
export function useProjectsList(page = 1, limit = 10) {
  return useQuery({
    queryKey: projectKeys.list(page, limit),
    queryFn: () => projectsApi.listProjects(page, limit),
  });
}

/**
 * Hook to fetch a single project
 */
export function useProject(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => projectsApi.getProject(id),
    enabled: Boolean(id),
  });
}

/**
 * Hook to create a new project
 */
export function useCreateProject() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (data: projectsApi.CreateProjectData) => projectsApi.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      toast.success('Project created successfully!');
    },
    onError: (error: unknown) => {
      toast.error(parseApiError(error));
    },
  });
}

/**
 * Hook to update a project
 */
export function useUpdateProject(id: string) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (data: projectsApi.UpdateProjectData) => projectsApi.updateProject(id, data),
    onSuccess: (updatedProject) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.setQueryData(projectKeys.detail(id), updatedProject);
      toast.success('Project updated successfully!');
    },
    onError: (error: unknown) => {
      toast.error(parseApiError(error));
    },
  });
}

/**
 * Hook to delete a project
 */
export function useDeleteProject() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (id: string) => projectsApi.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      toast.success('Project deleted successfully!');
    },
    onError: (error: unknown) => {
      toast.error(parseApiError(error));
    },
  });
}
