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

export interface Pagination {
  page: number;
  limit: number;
}

export interface EntryFilters extends Pagination {
  startDate?: string;
  endDate?: string;
  keyword?: string;
}

export interface ProjectStats {
  projectId: string;
  projectName: string;
  entryCount: number;
}

export interface ActivityData {
  date: string;
  count: number;
}

export interface RecentEntry extends LogEntry {
  projectName: string;
}

export interface HeatmapDay {
  date: string;       // ISO date string YYYY-MM-DD
  count: number;      // number of entries that day
  level: 0 | 1 | 2 | 3 | 4; // intensity level 0=none, 4=highest
}

export interface DashboardStats {
  totalProjects: number;
  totalEntries: number;
  recentEntries: RecentEntry[];
  activityData: ActivityData[];
  projectStats: ProjectStats[];
  heatmapData: HeatmapDay[];
  currentStreak: number;
  longestStreak: number;
}
