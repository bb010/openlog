import { useNavigate, useParams } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useProject, useUpdateProject } from '@/hooks/useProjects';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { PageLoading } from '@/components/common/LoadingSpinner';
import type { CreateProjectFormData } from '@/schemas/project';

/**
 * Edit existing project page
 */
export function EditProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { data: project, isLoading, isError } = useProject(projectId!);
  const updateProject = useUpdateProject(projectId!);

  const handleSubmit = async (data: CreateProjectFormData) => {
    await updateProject.mutateAsync(data);
    navigate(`/projects/${projectId}`);
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
    <div className="space-y-6 max-w-xl">
      <Breadcrumb
        items={[
          { label: 'Projects', to: '/projects' },
          { label: project.name, to: `/projects/${projectId}` },
          { label: 'Edit' },
        ]}
      />

      <div>
        <h1 className="text-2xl font-bold">Edit Project</h1>
        <p className="text-sm text-muted-foreground mt-1">Update project details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>Modify the information for this project</CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectForm
            mode="edit"
            defaultValues={{
              name: project.name,
              description: project.description ?? undefined,
            }}
            onSubmit={handleSubmit}
            onCancel={() => navigate(`/projects/${projectId}`)}
            isLoading={updateProject.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default EditProjectPage;
