import { listProjects } from './projectsApi';
import { listEntries } from './entriesApi';
import type { DashboardStats, ActivityData, ProjectStats, RecentEntry, HeatmapDay, LogEntry } from '@/types/models';
import { ACTIVITY_DAYS, MAX_ITEMS_PER_PAGE } from '@/utils/constants';

/**
 * Fetch all dashboard statistics by aggregating multiple API calls.
 *
 * Important: backend enforces limit <= 100. Use pagination for larger datasets.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  // Fetch all projects (up to 100)
  const projectsResult = await listProjects(1, 100);
  const projects = projectsResult.items;
  const totalProjects = projectsResult.total;

  // Fetch a small recent slice per project (also gives us all-time totals)
  const recentSliceResults = await Promise.all(
    projects.map((p) => listEntries(p.id, { page: 1, limit: 20 }))
  );

  // All-time totals
  let totalEntries = 0;
  for (const r of recentSliceResults) totalEntries += r.total;

  // Project stats based on all-time totals (top 10)
  const projectStats: ProjectStats[] = projects
    .map((p, i) => ({
      projectId: p.id,
      projectName: p.name,
      entryCount: recentSliceResults[i].total,
    }))
    .sort((a, b) => b.entryCount - a.entryCount)
    .slice(0, 10);

  // Recent entries: merge the first page from each project and pick top 10
  const recentMerged: RecentEntry[] = [];
  for (let i = 0; i < projects.length; i++) {
    for (const entry of recentSliceResults[i].items) {
      recentMerged.push({ ...entry, projectName: projects[i].name });
    }
  }
  recentMerged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const recentEntries = recentMerged.slice(0, 10);

  // Heatmap + streaks are based on last 365 days
  const { startDate, endDate } = getLastYearRange();

  const lastYearEntriesByProject = await Promise.all(
    projects.map((p) => fetchAllEntriesInRange(p.id, startDate, endDate))
  );

  const lastYearEntries: RecentEntry[] = [];
  for (let i = 0; i < projects.length; i++) {
    for (const entry of lastYearEntriesByProject[i]) {
      lastYearEntries.push({ ...entry, projectName: projects[i].name });
    }
  }

  // Activity chart based on last 7 days (computed from last-year entries)
  const activityData = buildActivityData(lastYearEntries, ACTIVITY_DAYS);

  // Heatmap based on last-year entries
  const heatmapData = buildHeatmapData(lastYearEntries);

  // Compute streaks
  const { currentStreak, longestStreak } = computeStreaks(heatmapData);

  return {
    totalProjects,
    totalEntries,
    recentEntries,
    activityData,
    projectStats,
    heatmapData,
    currentStreak,
    longestStreak,
  };
}

function getLastYearRange(): { startDate: string; endDate: string } {
  // Use local-time boundaries so entries created "today" in the user's timezone
  // are always included in the fetch window.
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const start = new Date(end);
  start.setDate(start.getDate() - 364);
  start.setHours(0, 0, 0, 0);

  return { startDate: start.toISOString(), endDate: end.toISOString() };
}

async function fetchAllEntriesInRange(projectId: string, startDate: string, endDate: string): Promise<LogEntry[]> {
  const limit = MAX_ITEMS_PER_PAGE;

  const first = await listEntries(projectId, { page: 1, limit, startDate, endDate });
  const items: LogEntry[] = [...first.items];

  if (first.totalPages <= 1) return items;

  // Fetch remaining pages (2..totalPages)
  const pagePromises: ReturnType<typeof listEntries>[] = [];
  for (let page = 2; page <= first.totalPages; page++) {
    pagePromises.push(listEntries(projectId, { page, limit, startDate, endDate }));
  }

  const rest = await Promise.all(pagePromises);
  for (const r of rest) items.push(...r.items);

  return items;
}

/**
 * Build activity data showing entry counts per day for the last N days
 */
function buildActivityData(entries: RecentEntry[], days: number): ActivityData[] {
  const result: ActivityData[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = toLocalDateStr(date);
    const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const count = entries.filter((e) => {
      const entryDate = toLocalDateStr(new Date(e.createdAt));
      return entryDate === dateStr;
    }).length;

    result.push({ date: label, count });
  }

  return result;
}

/**
 * Format a Date to a local YYYY-MM-DD string (avoids UTC offset shifting the date).
 */
function toLocalDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Build a full 365-day heatmap dataset.
 */
function buildHeatmapData(entries: RecentEntry[]): HeatmapDay[] {
  const countByDate: Record<string, number> = {};
  for (const entry of entries) {
    // Use local date (not UTC) so entries created today aren't bucketed to yesterday
    const dateStr = toLocalDateStr(new Date(entry.createdAt));
    countByDate[dateStr] = (countByDate[dateStr] ?? 0) + 1;
  }

  const maxCount = Math.max(1, ...Object.values(countByDate));

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days: HeatmapDay[] = [];

  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    // Use local date string so the grid aligns with the bucketed entry dates
    const dateStr = toLocalDateStr(d);
    const count = countByDate[dateStr] ?? 0;

    let level: HeatmapDay['level'] = 0;
    if (count > 0) {
      const ratio = count / maxCount;
      if (ratio <= 0.25) level = 1;
      else if (ratio <= 0.5) level = 2;
      else if (ratio <= 0.75) level = 3;
      else level = 4;
    }

    days.push({ date: dateStr, count, level });
  }

  return days;
}

/**
 * Compute current streak and longest streak from heatmap data
 */
function computeStreaks(heatmap: HeatmapDay[]): { currentStreak: number; longestStreak: number } {
  let currentStreak = 0;
  let longestStreak = 0;
  let running = 0;

  // Reverse so index 0 = today
  const reversed = [...heatmap].reverse();

  // Current streak: consecutive days with count > 0 from today backwards
  for (const day of reversed) {
    if (day.count > 0) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Longest streak: scan forwards
  for (const day of heatmap) {
    if (day.count > 0) {
      running++;
      if (running > longestStreak) longestStreak = running;
    } else {
      running = 0;
    }
  }

  return { currentStreak, longestStreak };
}
