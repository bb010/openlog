import { z } from 'zod';

export const CreateEntrySchema = z.object({
  content: z.string().min(1, 'Content is required'),
});

export const UpdateEntrySchema = z.object({
  content: z.string().min(1, 'Content is required').optional(),
});

export type CreateEntryFormData = z.infer<typeof CreateEntrySchema>;
export type UpdateEntryFormData = z.infer<typeof UpdateEntrySchema>;
