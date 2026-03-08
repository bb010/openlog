import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateEntrySchema, type CreateEntryFormData } from '@/schemas/entry';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface EntryFormProps {
  mode: 'create' | 'edit';
  defaultValues?: Partial<CreateEntryFormData>;
  onSubmit: (data: CreateEntryFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * Log entry creation/edit form — uses shadcn Textarea and Label
 */
export function EntryForm({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
}: EntryFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateEntryFormData>({
    resolver: zodResolver(CreateEntrySchema),
    defaultValues: defaultValues || { content: '' },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="content">
          Log Content <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="content"
          {...register('content')}
          placeholder="What happened? What did you build, fix, or learn?"
          rows={6}
          disabled={isLoading}
          autoFocus
          className="resize-y font-mono"
          aria-invalid={!!errors.content}
        />
        {errors.content && (
          <p className="text-xs text-destructive">{errors.content.message}</p>
        )}
      </div>

      <div className="flex gap-3">
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
          {isLoading ? 'Saving...' : mode === 'create' ? 'Create Entry' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}

export default EntryForm;
