import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { ZodError } from 'zod';
import { CreateEntrySchema, UpdateEntrySchema, EntryFiltersSchema } from '../schemas/entry.js';
import * as entryService from '../services/entryService.js';
import * as imageService from '../services/imageService.js';
import { successResponse } from '../middleware/responseFormatter.js';
import { handleError, AppError } from '../middleware/errorHandler.js';
import { ERROR_CODES } from '../utils/constants.js';

/** Shared zValidator hook — routes Zod errors through our error handler */
function validationHook(result: { success: boolean; error?: ZodError }, c: any): Response | void {
  if (!result.success && result.error) {
    return handleError(result.error, c);
  }
}

const entries = new Hono();

// POST /projects/:projectId/entries — Create log entry
entries.post('/projects/:projectId/entries', zValidator('json', CreateEntrySchema, validationHook), async (c) => {
  try {
    const projectId = c.req.param('projectId');
    const body = c.req.valid('json');
    const entry = entryService.createEntry(projectId, body);
    return c.json(successResponse(entry), 201);
  } catch (err) {
    return handleError(err as Error, c);
  }
});

// GET /projects/:projectId/entries — List entries (paginated, filterable)
entries.get('/projects/:projectId/entries', zValidator('query', EntryFiltersSchema, validationHook), async (c) => {
  try {
    const projectId = c.req.param('projectId');
    const query = c.req.valid('query');
    const result = entryService.listEntries(projectId, query);
    return c.json(successResponse(result));
  } catch (err) {
    return handleError(err as Error, c);
  }
});

// GET /projects/:projectId/entries/:entryId — Get single entry
entries.get('/projects/:projectId/entries/:entryId', async (c) => {
  try {
    const projectId = c.req.param('projectId');
    const entryId = c.req.param('entryId');
    const entry = entryService.getEntry(projectId, entryId);
    return c.json(successResponse(entry));
  } catch (err) {
    return handleError(err as Error, c);
  }
});

// PUT /projects/:projectId/entries/:entryId — Update entry
entries.put(
  '/projects/:projectId/entries/:entryId',
  zValidator('json', UpdateEntrySchema, validationHook),
  async (c) => {
    try {
      const projectId = c.req.param('projectId');
      const entryId = c.req.param('entryId');
      const body = c.req.valid('json');
      const entry = entryService.updateEntry(projectId, entryId, body);
      return c.json(successResponse(entry));
    } catch (err) {
      return handleError(err as Error, c);
    }
  }
);

// DELETE /projects/:projectId/entries/:entryId — Delete entry (and associated image)
entries.delete('/projects/:projectId/entries/:entryId', async (c) => {
  try {
    const projectId = c.req.param('projectId');
    const entryId = c.req.param('entryId');
    entryService.deleteEntry(projectId, entryId);
    return c.json(successResponse({ deleted: true }));
  } catch (err) {
    return handleError(err as Error, c);
  }
});

// POST /projects/:projectId/entries/:entryId/image — Upload image to entry
entries.post('/projects/:projectId/entries/:entryId/image', async (c) => {
  try {
    const projectId = c.req.param('projectId');
    const entryId = c.req.param('entryId');

    // Get form data
    const formData = await c.req.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      throw new AppError(
        ERROR_CODES.VALIDATION_ERROR,
        'No image file provided',
        400
      );
    }

    const buffer = await file.arrayBuffer();
    const imagePath = imageService.saveImage(projectId, file.name, Buffer.from(buffer));

    const entry = entryService.attachImageToEntry(projectId, entryId, imagePath);
    return c.json(successResponse(entry), 201);
  } catch (err) {
    return handleError(err as Error, c);
  }
});

export default entries;
