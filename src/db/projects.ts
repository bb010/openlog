import { randomUUID } from 'crypto';
import { getDatabase } from './init.js';
import type { Project } from '../types/models.js';

export function createProject(input: {
  name: string;
  path: string;
  description?: string | null;
}): Project {
  const db = getDatabase();
  const id = randomUUID();
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO projects (id, name, path, description, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  stmt.run(id, input.name, input.path, input.description ?? null, now, now);

  return {
    id,
    name: input.name,
    path: input.path,
    description: input.description ?? null,
    createdAt: now,
    updatedAt: now,
  };
}

export function getProjectById(id: string): Project | null {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM projects WHERE id = ?');
  const row = stmt.get(id) as unknown as Project | undefined;
  return row ?? null;
}

export function listProjects(
  limit: number,
  offset: number
): { items: Project[]; total: number } {
  const db = getDatabase();

  const items = db.prepare(
    'SELECT * FROM projects ORDER BY createdAt DESC LIMIT ? OFFSET ?'
  ).all(limit, offset) as unknown as Project[];

  const row = db.prepare('SELECT COUNT(*) as count FROM projects').get() as unknown as { count: number };

  return { items, total: Number(row.count) };
}

export function updateProject(
  id: string,
  updates: Partial<Pick<Project, 'name' | 'description'>>
): Project | null {
  const db = getDatabase();

  const existing = getProjectById(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const fields = Object.keys(updates)
    .filter((k) => updates[k as keyof typeof updates] !== undefined)
    .map((k) => `${k} = ?`)
    .join(', ');

  if (!fields) return existing;

  const values = Object.keys(updates)
    .filter((k) => updates[k as keyof typeof updates] !== undefined)
    .map((k) => updates[k as keyof typeof updates] ?? null);

  db.prepare(`UPDATE projects SET ${fields}, updatedAt = ? WHERE id = ?`).run(
    ...values,
    now,
    id
  );

  return getProjectById(id);
}

export function deleteProject(id: string): boolean {
  const db = getDatabase();
  const result = db.prepare('DELETE FROM projects WHERE id = ?').run(id);
  return (result.changes as number) > 0;
}
