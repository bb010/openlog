import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as entriesApi from '@/api/entriesApi';
import type { EntryFilters } from '@/types/models';
import { useToast } from './useToast';
import { parseApiError } from '@/utils/errors';

// Query keys
export const entryKeys = {
  all: (projectId: string) => ['entries', projectId] as const,
  lists: (projectId: string) => [...entryKeys.all(projectId), 'list'] as const,
  list: (projectId: string, filters: Partial<EntryFilters>) =>
    [...entryKeys.lists(projectId), filters] as const,
  details: (projectId: string) => [...entryKeys.all(projectId), 'detail'] as const,
  detail: (projectId: string, entryId: string) => [...entryKeys.details(projectId), entryId] as const,
};

/**
 * Hook to fetch paginated, filtered entries for a project
 */
export function useEntries(projectId: string, filters: Partial<EntryFilters> = {}) {
  return useQuery({
    queryKey: entryKeys.list(projectId, filters),
    queryFn: () => entriesApi.listEntries(projectId, filters),
    enabled: Boolean(projectId),
  });
}

/**
 * Hook to fetch a single entry
 */
export function useEntry(projectId: string, entryId: string) {
  return useQuery({
    queryKey: entryKeys.detail(projectId, entryId),
    queryFn: () => entriesApi.getEntry(projectId, entryId),
    enabled: Boolean(projectId) && Boolean(entryId),
  });
}

/**
 * Hook to create a new entry
 */
export function useCreateEntry(projectId: string) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (data: entriesApi.CreateEntryData) => entriesApi.createEntry(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: entryKeys.lists(projectId) });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Log entry created!');
    },
    onError: (error: unknown) => {
      toast.error(parseApiError(error));
    },
  });
}

/**
 * Hook to update an entry
 */
export function useUpdateEntry(projectId: string, entryId: string) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (data: entriesApi.UpdateEntryData) =>
      entriesApi.updateEntry(projectId, entryId, data),
    onSuccess: (updatedEntry) => {
      queryClient.invalidateQueries({ queryKey: entryKeys.lists(projectId) });
      queryClient.setQueryData(entryKeys.detail(projectId, entryId), updatedEntry);
      toast.success('Entry updated successfully!');
    },
    onError: (error: unknown) => {
      toast.error(parseApiError(error));
    },
  });
}

/**
 * Hook to delete an entry
 */
export function useDeleteEntry(projectId: string) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (entryId: string) => entriesApi.deleteEntry(projectId, entryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: entryKeys.lists(projectId) });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Entry deleted successfully!');
    },
    onError: (error: unknown) => {
      toast.error(parseApiError(error));
    },
  });
}

/**
 * Hook to upload an image to an entry
 */
export function useUploadImage(projectId: string, entryId: string) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (file: File) => entriesApi.uploadImage(projectId, entryId, file),
    onSuccess: (updatedEntry) => {
      queryClient.invalidateQueries({ queryKey: entryKeys.lists(projectId) });
      queryClient.setQueryData(entryKeys.detail(projectId, entryId), updatedEntry);
      toast.success('Image uploaded successfully!');
    },
    onError: (error: unknown) => {
      toast.error(parseApiError(error));
    },
  });
}
