import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import type { Project } from '@/types/models';

interface ProjectDeleteModalProps {
  project: Project | null;
  onClose: () => void;
  onConfirm: (projectId: string) => void;
  isLoading?: boolean;
}

/**
 * Confirmation dialog for deleting a project
 */
export function ProjectDeleteModal({ project, onClose, onConfirm, isLoading }: ProjectDeleteModalProps) {
  return (
    <ConfirmDialog
      isOpen={Boolean(project)}
      onClose={onClose}
      onConfirm={() => project && onConfirm(project.id)}
      title="Delete Project"
      message={
        project
          ? `Are you sure you want to delete "${project.name}"? This will permanently delete all log entries associated with this project. This action cannot be undone.`
          : ''
      }
      confirmLabel="Delete Project"
      isLoading={isLoading}
      variant="danger"
    />
  );
}

export default ProjectDeleteModal;
