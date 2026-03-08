import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { ZodError } from 'zod';
import { CreateProjectSchema, UpdateProjectSchema, PaginationSchema } from '../schemas/project.js';
import * as projectService from '../services/projectService.js';
import { successResponse } from '../middleware/responseFormatter.js';
import { handleError } from '../middleware/errorHandler.js';

/** Shared zValidator hook — routes Zod errors through our error handler */
function validationHook(result: { success: boolean; error?: ZodError }, c: any) {
  if (!result.success && result.error) {
    return handleError(result.error, c);
  }
}

const projects = new Hono();

// POST /projects — Create a new project
projects.post('/', zValidator('json', CreateProjectSchema, validationHook), async (c) => {
  try {
    const body = c.req.valid('json');
    const project = projectService.createProject(body);
    return c.json(successResponse(project), 201);
  } catch (err) {
    return handleError(err as Error, c);
  }
});

// GET /projects — List all projects (paginated)
projects.get('/', zValidator('query', PaginationSchema, validationHook), async (c) => {
  try {
    const query = c.req.valid('query');
    const result = projectService.listProjects(query);
    return c.json(successResponse(result));
  } catch (err) {
    return handleError(err as Error, c);
  }
});

// GET /projects/:id — Get a single project
projects.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const project = projectService.getProject(id);
    return c.json(successResponse(project));
  } catch (err) {
    return handleError(err as Error, c);
  }
});

// PUT /projects/:id — Update a project
projects.put('/:id', zValidator('json', UpdateProjectSchema, validationHook), async (c) => {
  try {
    const id = c.req.param('id');
    const body = c.req.valid('json');
    const project = projectService.updateProject(id, body);
    return c.json(successResponse(project));
  } catch (err) {
    return handleError(err as Error, c);
  }
});

// DELETE /projects/:id — Delete a project (cascades to entries)
projects.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    projectService.deleteProject(id);
    return c.json(successResponse({ deleted: true }));
  } catch (err) {
    return handleError(err as Error, c);
  }
});

export default projects;
