import { z } from 'zod';

export const CreateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(255, 'Project name must be less than 255 characters'),
  path: z.string().min(1, 'Project path is required'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional().nullable(),
});

export const UpdateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(255, 'Project name must be less than 255 characters').optional(),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional().nullable(),
});

export const PaginationSchema = z.object({
  page: z.coerce.number().min(1, 'Page must be at least 1').default(1),
  limit: z.coerce.number().min(1).max(100, 'Limit must be at most 100').default(10),
});

export type CreateProject = z.infer<typeof CreateProjectSchema>;
export type UpdateProject = z.infer<typeof UpdateProjectSchema>;
export type Pagination = z.infer<typeof PaginationSchema>;
