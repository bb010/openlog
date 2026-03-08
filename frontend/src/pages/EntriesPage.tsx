import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, AlertCircle, FolderOpen } from 'lucide-react';
import type { LogEntry } from '@/types/models';
import { useProject } from '@/hooks/useProjects';
import { useEntries, useCreateEntry, useUpdateEntry, useDeleteEntry, useUploadImage } from '@/hooks/useEntries';
import { useFilterContext } from '@/context/useFilterContext';
import { EntriesTable } from '@/components/entries/EntriesTable';
import { EntryForm } from '@/components/entries/EntryForm';
import { EntryDeleteModal } from '@/components/entries/EntryDeleteModal';
import { ImageUpload } from '@/components/entries/ImageUpload';
import { EntryFilters } from '@/components/filters/EntryFilters';
import { FilterBadge } from '@/components/filters/FilterBadge';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription, AlertAction } from '@/components/ui/alert';
import { Modal } from '@/components/common/Modal';
import { PageLoading } from '@/components/common/LoadingSpinner';
import type { CreateEntryFormData } from '@/schemas/entry';

type ModalState =
  | { type: 'none' }
  | { type: 'create' }
  | { type: 'edit'; entry: LogEntry }
  | { type: 'image'; entry: LogEntry };

/**
 * Log entries page with filtering, pagination, CRUD operations
 */
export function EntriesPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { filters, setPage, activeFilterCount } = useFilterContext();
  const [modal, setModal] = useState<ModalState>({ type: 'none' });
  const [entryToDelete, setEntryToDelete] = useState<LogEntry | null>(null);

  const { data: project, isLoading: projectLoading } = useProject(projectId!);
  const { data: entries, isLoading: entriesLoading, isError, error, refetch } = useEntries(
    projectId!,
    filters
  );

  const createEntry = useCreateEntry(projectId!);
  const updateEntry = useUpdateEntry(
    projectId!,
    modal.type === 'edit' ? modal.entry.id : ''
  );
  const deleteEntry = useDeleteEntry(projectId!);
  const uploadImage = useUploadImage(
    projectId!,
    modal.type === 'image' ? modal.entry.id : ''
  );

  const handleCreateSubmit = async (data: CreateEntryFormData) => {
    await createEntry.mutateAsync(data);
    setModal({ type: 'none' });
  };

  const handleEditSubmit = async (data: CreateEntryFormData) => {
    await updateEntry.mutateAsync(data);
    setModal({ type: 'none' });
  };

  const handleDeleteConfirm = async (entryId: string) => {
    await deleteEntry.mutateAsync(entryId);
    setEntryToDelete(null);
  };

  const handleImageUpload = async (file: File) => {
    await uploadImage.mutateAsync(file);
    setModal({ type: 'none' });
  };

  if (projectLoading) return <PageLoading label="Loading project..." />;

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Projects', to: '/projects' },
          { label: project?.name || 'Project', to: `/projects/${projectId}` },
          { label: 'Entries' },
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
            <FolderOpen className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold">
              {project?.name || 'Log Entries'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {entries ? `${entries.total} entr${entries.total !== 1 ? 'ies' : 'y'}` : 'Loading...'}
              {activeFilterCount > 0 && (
                <span className="ml-2 inline-flex items-center gap-1 text-blue-600">
                  · <FilterBadge count={activeFilterCount} /> filter{activeFilterCount > 1 ? 's' : ''} active
                </span>
              )}
            </p>
          </div>
        </div>
        <Button size="sm" onClick={() => setModal({ type: 'create' })}>
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Entry</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      {/* Error state */}
      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Failed to load entries</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Unknown error'}
          </AlertDescription>
          <AlertAction>
            <Button variant="ghost" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </AlertAction>
        </Alert>
      )}

      {/* Filters */}
      <EntryFilters />

      {/* Entries list */}
      <EntriesTable
        data={entries}
        isLoading={entriesLoading}
        onEdit={(entry) => setModal({ type: 'edit', entry })}
        onDelete={setEntryToDelete}
        onUploadImage={(entry) => setModal({ type: 'image', entry })}
        onCreateEntry={() => setModal({ type: 'create' })}
        page={filters.page}
        onPageChange={setPage}
      />

      {/* Create entry modal */}
      <Modal
        isOpen={modal.type === 'create'}
        onClose={() => setModal({ type: 'none' })}
        title="New Log Entry"
        size="lg"
      >
        <EntryForm
          mode="create"
          onSubmit={handleCreateSubmit}
          onCancel={() => setModal({ type: 'none' })}
          isLoading={createEntry.isPending}
        />
      </Modal>

      {/* Edit entry modal */}
      <Modal
        isOpen={modal.type === 'edit'}
        onClose={() => setModal({ type: 'none' })}
        title="Edit Entry"
        size="lg"
      >
        {modal.type === 'edit' && (
          <EntryForm
            mode="edit"
            defaultValues={{ content: modal.entry.content }}
            onSubmit={handleEditSubmit}
            onCancel={() => setModal({ type: 'none' })}
            isLoading={updateEntry.isPending}
          />
        )}
      </Modal>

      {/* Image upload modal */}
      <Modal
        isOpen={modal.type === 'image'}
        onClose={() => setModal({ type: 'none' })}
        title="Upload Image"
        size="md"
      >
        <ImageUpload
          onUpload={handleImageUpload}
          isLoading={uploadImage.isPending}
        />
      </Modal>

      {/* Delete confirmation */}
      <EntryDeleteModal
        entry={entryToDelete}
        onClose={() => setEntryToDelete(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteEntry.isPending}
      />
    </div>
  );
}

export default EntriesPage;
