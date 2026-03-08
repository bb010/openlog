import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { ProjectStats } from '@/types/models';

interface ProjectStatsChartProps {
  data: ProjectStats[];
}

const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#14b8a6'];

/**
 * Bar chart showing number of entries per project
 */
export function ProjectStatsChart({ data }: ProjectStatsChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        No project data available
      </div>
    );
  }

  // Truncate long project names for the chart
  const chartData = data.slice(0, 5).map((p) => ({
    ...p,
    displayName: p.projectName.length > 15 ? p.projectName.slice(0, 13) + '…' : p.projectName,
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis
          dataKey="displayName"
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
          width={30}
        />
        <Tooltip
          contentStyle={{
            fontSize: 12,
            borderRadius: 8,
            border: '1px solid #e5e7eb',
          }}
          formatter={(value) => [value, 'Entries']}
          labelFormatter={(label) => {
            const project = data.find((p) =>
              p.projectName.startsWith(label.replace('…', ''))
            );
            return project?.projectName || label;
          }}
        />
        <Bar dataKey="entryCount" radius={[4, 4, 0, 0]}>
          {chartData.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default ProjectStatsChart;
