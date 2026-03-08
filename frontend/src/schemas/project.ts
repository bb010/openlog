import { z } from 'zod';

export const CreateProjectSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name is required')
    .max(255, 'Project name must be less than 255 characters'),
  path: z.string().min(1, 'Project path is required'),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional()
    .nullable(),
});

export const UpdateProjectSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name is required')
    .max(255, 'Project name must be less than 255 characters')
    .optional(),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional()
    .nullable(),
});

export type CreateProjectFormData = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectFormData = z.infer<typeof UpdateProjectSchema>;
