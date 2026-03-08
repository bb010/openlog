import { z } from 'zod';

export const CreateEntrySchema = z.object({
  content: z.string().min(1, 'Content is required'),
});

export const UpdateEntrySchema = z.object({
  content: z.string().min(1, 'Content is required').optional(),
});

export const EntryFiltersSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  startDate: z.string().datetime({ message: 'startDate must be a valid ISO 8601 date' }).optional(),
  endDate: z.string().datetime({ message: 'endDate must be a valid ISO 8601 date' }).optional(),
  keyword: z.string().max(255).optional(),
});

export type CreateEntry = z.infer<typeof CreateEntrySchema>;
export type UpdateEntry = z.infer<typeof UpdateEntrySchema>;
export type EntryFilters = z.infer<typeof EntryFiltersSchema>;
