import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, AlertCircle } from 'lucide-react';
import type { Project } from '@/types/models';
import { useProjectsList, useDeleteProject } from '@/hooks/useProjects';
import { ProjectTable } from '@/components/projects/ProjectTable';
import { ProjectDeleteModal } from '@/components/projects/ProjectDeleteModal';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription, AlertAction } from '@/components/ui/alert';

/**
 * Projects listing page
 */
export function ProjectsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const { data, isLoading, isError, error, refetch } = useProjectsList(page, 10);
  const deleteProject = useDeleteProject();

  const handleDeleteConfirm = async (projectId: string) => {
    await deleteProject.mutateAsync(projectId);
    setProjectToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {data ? `${data.total} project${data.total !== 1 ? 's' : ''}` : 'Manage your projects'}
          </p>
        </div>
        <Link to="/projects/new">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      {/* Error state */}
      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Failed to load projects</AlertTitle>
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

      {/* Projects table */}
      <Card>
        <ProjectTable
          data={data}
          isLoading={isLoading}
          onEdit={(project) => navigate(`/projects/${project.id}/edit`)}
          onDelete={setProjectToDelete}
          page={page}
          onPageChange={setPage}
        />
      </Card>

      {/* Delete confirmation */}
      <ProjectDeleteModal
        project={projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteProject.isPending}
      />
    </div>
  );
}

export default ProjectsPage;
