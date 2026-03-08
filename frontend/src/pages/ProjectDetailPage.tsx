import { useNavigate, useParams, Link } from 'react-router-dom';
import { Edit2, Trash2, FileText, FolderOpen, AlertCircle, Calendar } from 'lucide-react';
import { useState } from 'react';
import { useProject, useDeleteProject } from '@/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { PageLoading } from '@/components/common/LoadingSpinner';
import { ProjectDeleteModal } from '@/components/projects/ProjectDeleteModal';
import { formatDate } from '@/utils/formatDate';

/**
 * Project detail page showing project info and navigation to entries
 */
export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data: project, isLoading, isError } = useProject(projectId!);
  const deleteProject = useDeleteProject();

  const handleDeleteConfirm = async (id: string) => {
    await deleteProject.mutateAsync(id);
    navigate('/projects');
  };

  if (isLoading) return <PageLoading label="Loading project..." />;

  if (isError || !project) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Project not found</AlertTitle>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Projects', to: '/projects' }, { label: project.name }]} />

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
            <FolderOpen className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            {project.description && (
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{project.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link to={`/projects/${projectId}/edit`}>
            <Button variant="outline" size="sm">
              <Edit2 className="h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Project details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Path</p>
                <code className="text-sm bg-muted px-2 py-1 rounded font-mono break-all">
                  {project.path}
                </code>
              </div>
              <div className="flex gap-6">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Created</p>
                  <p className="text-sm flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    {formatDate(project.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Updated</p>
                  <p className="text-sm flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    {formatDate(project.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigate to entries */}
        <Link to={`/projects/${projectId}/entries`} className="block">
          <div className="h-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-xl p-6 hover:from-blue-700 hover:to-indigo-700 transition-all cursor-pointer">
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-lg bg-white/20 p-2">
                <FileText className="h-5 w-5" />
              </div>
              <span className="font-semibold">View Log Entries</span>
            </div>
            <p className="text-sm text-blue-100">
              Browse, filter, and manage all log entries for this project
            </p>
          </div>
        </Link>
      </div>

      <ProjectDeleteModal
        project={showDeleteModal ? project : null}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteProject.isPending}
      />
    </div>
  );
}

export default ProjectDetailPage;
