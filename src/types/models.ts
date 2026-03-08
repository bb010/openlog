export interface Project {
  id: string;
  name: string;
  path: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LogEntry {
  id: string;
  projectId: string;
  content: string;
  imagePath?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
