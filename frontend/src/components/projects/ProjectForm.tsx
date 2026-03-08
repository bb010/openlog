import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Project } from '@/types/models';
import {
  CreateProjectSchema,
  type CreateProjectFormData,
} from '@/schemas/project';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface ProjectFormProps {
  mode: 'create' | 'edit';
  defaultValues?: Partial<CreateProjectFormData>;
  onSubmit: (data: CreateProjectFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  project?: Project;
}

/**
 * Project creation/edit form with Zod validation — uses shadcn Input, Textarea, Label
 */
export function ProjectForm({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
}: ProjectFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateProjectFormData>({
    resolver: zodResolver(CreateProjectSchema),
    defaultValues: defaultValues || {},
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {/* Project Name */}
      <div className="space-y-1.5">
        <Label htmlFor="name">
          Project Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          type="text"
          {...register('name')}
          placeholder="e.g., My Awesome Project"
          disabled={isLoading}
          aria-invalid={!!errors.name}
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Project Path */}
      {mode === 'create' && (
        <div className="space-y-1.5">
          <Label htmlFor="path">
            Project Path <span className="text-destructive">*</span>
          </Label>
          <Input
            id="path"
            type="text"
            {...register('path')}
            placeholder="e.g., /Users/me/projects/my-app"
            disabled={isLoading}
            className="font-mono text-xs"
            aria-invalid={!!errors.path}
          />
          {errors.path && (
            <p className="text-xs text-destructive">{errors.path.message}</p>
          )}
          <p className="text-xs text-muted-foreground">The filesystem path to your project</p>
        </div>
      )}

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description">
          Description{' '}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="What is this project about?"
          rows={3}
          disabled={isLoading}
          className="resize-none"
        />
        {errors.description && (
          <p className="text-xs text-destructive">{errors.description.message}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : mode === 'create' ? 'Create Project' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}

export default ProjectForm;
