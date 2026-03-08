export const SCHEMA = `
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    path TEXT NOT NULL,
    description TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS logEntries (
    id TEXT PRIMARY KEY,
    projectId TEXT NOT NULL,
    content TEXT NOT NULL,
    imagePath TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_entries_projectId ON logEntries(projectId);
  CREATE INDEX IF NOT EXISTS idx_entries_createdAt ON logEntries(createdAt);
`;
