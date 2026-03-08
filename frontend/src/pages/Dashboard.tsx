import { FolderOpen, FileText, RefreshCw, AlertCircle, Flame, Calendar } from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboard';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { ActivityChart } from '@/components/dashboard/ActivityChart';
import { ProjectStatsChart } from '@/components/dashboard/ProjectStatsChart';
import { RecentEntriesList } from '@/components/dashboard/RecentEntriesList';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { ActivityHeatmap } from '@/components/dashboard/ActivityHeatmap';
import { SkeletonStats } from '@/components/common/Skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription, AlertAction } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Main dashboard page showing statistics, charts, heatmap, and recent activity
 */
export function Dashboard() {
  const { data: stats, isLoading, isError, error, refetch } = useDashboardStats();

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Overview of your logging activity</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetch()}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Error state */}
      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Failed to load dashboard data</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Unknown error'}
          </AlertDescription>
          <AlertAction>
            <Button variant="ghost" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </AlertAction>
        </Alert>
      )}

      {/* Quick actions */}
      <QuickActions />

      {/* Statistics row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            <SkeletonStats />
            <SkeletonStats />
            <SkeletonStats />
            <SkeletonStats />
          </>
        ) : (
          <>
            <StatsCard
              title="Total Projects"
              value={stats?.totalProjects ?? 0}
              icon={<FolderOpen className="h-6 w-6 text-blue-600" />}
              iconBg="bg-blue-100 dark:bg-blue-900/40"
              subtitle="Active projects"
            />
            <StatsCard
              title="Total Entries"
              value={stats?.totalEntries ?? 0}
              icon={<FileText className="h-6 w-6 text-indigo-600" />}
              iconBg="bg-indigo-100 dark:bg-indigo-900/40"
              subtitle="Across all projects"
            />
            <StatsCard
              title="Current Streak"
              value={`${stats?.currentStreak ?? 0}d`}
              icon={<Flame className="h-6 w-6 text-orange-500" />}
              iconBg="bg-orange-100 dark:bg-orange-900/40"
              subtitle="Consecutive days"
            />
            <StatsCard
              title="Longest Streak"
              value={`${stats?.longestStreak ?? 0}d`}
              icon={<Calendar className="h-6 w-6 text-emerald-600" />}
              iconBg="bg-emerald-100 dark:bg-emerald-900/40"
              subtitle="Personal best"
            />
          </>
        )}
      </div>

      {/* Activity Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Heatmap</CardTitle>
          <CardDescription>Log entries over the past year</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <ActivityHeatmap
              data={stats?.heatmapData ?? []}
              currentStreak={stats?.currentStreak}
              longestStreak={stats?.longestStreak}
            />
          )}
        </CardContent>
      </Card>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Activity (Last 7 Days)</CardTitle>
            <CardDescription>Log entries created per day</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                <Skeleton className="h-40 w-full" />
              </div>
            ) : (
              <ActivityChart data={stats?.activityData ?? []} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Entries per Project</CardTitle>
            <CardDescription>Top 5 most active projects</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                <Skeleton className="h-40 w-full" />
              </div>
            ) : (
              <ProjectStatsChart data={stats?.projectStats ?? []} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent entries */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest log entries across all projects</CardDescription>
        </CardHeader>
        <CardContent className="px-2 py-2">
          <RecentEntriesList
            entries={stats?.recentEntries ?? []}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default Dashboard;
