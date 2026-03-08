import { useNavigate } from 'react-router-dom';
import { useCreateProject } from '@/hooks/useProjects';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import type { CreateProjectFormData } from '@/schemas/project';

/**
 * Create new project page
 */
export function CreateProjectPage() {
  const navigate = useNavigate();
  const createProject = useCreateProject();

  const handleSubmit = async (data: CreateProjectFormData) => {
    await createProject.mutateAsync(data);
    navigate('/projects');
  };

  return (
    <div className="space-y-6 max-w-xl">
      <Breadcrumb items={[{ label: 'Projects', to: '/projects' }, { label: 'New Project' }]} />

      <div>
        <h1 className="text-2xl font-bold">Create Project</h1>
        <p className="text-sm text-muted-foreground mt-1">Add a new project to start logging</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>Fill in the information about your project</CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectForm
            mode="create"
            onSubmit={handleSubmit}
            onCancel={() => navigate('/projects')}
            isLoading={createProject.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default CreateProjectPage;
