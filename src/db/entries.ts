import { randomUUID } from 'crypto';
import { getDatabase } from './init.js';
import type { LogEntry } from '../types/models.js';

export function createEntry(input: {
  projectId: string;
  content: string;
  imagePath?: string | null;
}): LogEntry {
  const db = getDatabase();
  const id = randomUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO logEntries (id, projectId, content, imagePath, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, input.projectId, input.content, input.imagePath ?? null, now, now);

  return {
    id,
    projectId: input.projectId,
    content: input.content,
    imagePath: input.imagePath ?? null,
    createdAt: now,
    updatedAt: now,
  };
}

export function getEntryById(id: string): LogEntry | null {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM logEntries WHERE id = ?').get(id) as unknown as LogEntry | undefined;
  return row ?? null;
}

export function getEntryByIdAndProject(id: string, projectId: string): LogEntry | null {
  const db = getDatabase();
  const row = db.prepare(
    'SELECT * FROM logEntries WHERE id = ? AND projectId = ?'
  ).get(id, projectId) as unknown as LogEntry | undefined;
  return row ?? null;
}

export function listEntriesByProject(
  projectId: string,
  limit: number,
  offset: number,
  filters?: {
    startDate?: string;
    endDate?: string;
    keyword?: string;
  }
): { items: LogEntry[]; total: number } {
  const db = getDatabase();

  let query = 'SELECT * FROM logEntries WHERE projectId = ?';
  let countQuery = 'SELECT COUNT(*) as count FROM logEntries WHERE projectId = ?';
  const params: (string | number)[] = [projectId];
  const countParams: (string | number)[] = [projectId];

  if (filters?.startDate) {
    query += ' AND createdAt >= ?';
    countQuery += ' AND createdAt >= ?';
    params.push(filters.startDate);
    countParams.push(filters.startDate);
  }
  if (filters?.endDate) {
    query += ' AND createdAt <= ?';
    countQuery += ' AND createdAt <= ?';
    params.push(filters.endDate);
    countParams.push(filters.endDate);
  }
  if (filters?.keyword) {
    query += ' AND content LIKE ?';
    countQuery += ' AND content LIKE ?';
    params.push(`%${filters.keyword}%`);
    countParams.push(`%${filters.keyword}%`);
  }

  query += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const items = db.prepare(query).all(...params) as unknown as LogEntry[];
  const row = db.prepare(countQuery).get(...countParams) as unknown as { count: number };

  return { items, total: Number(row.count) };
}

export function updateEntry(
  id: string,
  updates: Partial<Pick<LogEntry, 'content' | 'imagePath'>>
): LogEntry | null {
  const db = getDatabase();

  const existing = getEntryById(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const keys = Object.keys(updates).filter(
    (k) => updates[k as keyof typeof updates] !== undefined
  );

  if (keys.length === 0) return existing;

  const fields = keys.map((k) => `${k} = ?`).join(', ');
  const values = keys.map((k) => updates[k as keyof typeof updates] ?? null);

  db.prepare(`UPDATE logEntries SET ${fields}, updatedAt = ? WHERE id = ?`).run(
    ...values,
    now,
    id
  );

  return getEntryById(id);
}

export function deleteEntry(id: string): boolean {
  const db = getDatabase();
  const result = db.prepare('DELETE FROM logEntries WHERE id = ?').run(id);
  return (result.changes as number) > 0;
}

export function deleteEntriesByProject(projectId: string): number {
  const db = getDatabase();
  const result = db.prepare('DELETE FROM logEntries WHERE projectId = ?').run(projectId);
  return result.changes as number;
}
