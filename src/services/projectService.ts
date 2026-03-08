import {
  createProject as dbCreateProject,
  getProjectById,
  listProjects as dbListProjects,
  updateProject as dbUpdateProject,
  deleteProject as dbDeleteProject,
} from '../db/projects.js';
import type { Project, PaginatedResponse } from '../types/models.js';
import type { CreateProject, UpdateProject, Pagination } from '../schemas/project.js';
import { AppError } from '../middleware/errorHandler.js';
import { ERROR_CODES, PAGINATION } from '../utils/constants.js';

export function createProject(input: CreateProject): Project {
  try {
    return dbCreateProject(input);
  } catch (err: any) {
    if (err?.message?.includes('UNIQUE constraint failed: projects.name')) {
      throw new AppError(
        ERROR_CODES.DUPLICATE_PROJECT,
        `A project with the name "${input.name}" already exists`,
        409
      );
    }
    throw err;
  }
}

export function getProject(id: string): Project {
  const project = getProjectById(id);
  if (!project) {
    throw new AppError(
      ERROR_CODES.PROJECT_NOT_FOUND,
      `Project with id "${id}" not found`,
      404
    );
  }
  return project;
}

export function listProjects(pagination: Pagination): PaginatedResponse<Project> {
  const limit = Math.min(pagination.limit, PAGINATION.MAX_LIMIT);
  const page = pagination.page;
  const offset = (page - 1) * limit;

  const { items, total } = dbListProjects(limit, offset);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export function updateProject(id: string, updates: UpdateProject): Project {
  const existing = getProjectById(id);
  if (!existing) {
    throw new AppError(
      ERROR_CODES.PROJECT_NOT_FOUND,
      `Project with id "${id}" not found`,
      404
    );
  }

  try {
    const updated = dbUpdateProject(id, updates);
    return updated!;
  } catch (err: any) {
    if (err?.message?.includes('UNIQUE constraint failed: projects.name')) {
      throw new AppError(
        ERROR_CODES.DUPLICATE_PROJECT,
        `A project with the name "${updates.name}" already exists`,
        409
      );
    }
    throw err;
  }
}

export function deleteProject(id: string): void {
  const existing = getProjectById(id);
  if (!existing) {
    throw new AppError(
      ERROR_CODES.PROJECT_NOT_FOUND,
      `Project with id "${id}" not found`,
      404
    );
  }
  dbDeleteProject(id);
}
