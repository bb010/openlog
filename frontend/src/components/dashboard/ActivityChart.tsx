import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { ActivityData } from '@/types/models';

interface ActivityChartProps {
  data: ActivityData[];
}

/**
 * Line chart showing log entry creation trends over time
 */
export function ActivityChart({ data }: ActivityChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        No activity data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="date"
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
            boxShadow: '0 4px 6px -1px rgba(0,0,0,.1)',
          }}
          formatter={(value) => [value, 'Entries']}
        />
        <Line
          type="monotone"
          dataKey="count"
          stroke="#3b82f6"
          strokeWidth={2.5}
          dot={{ fill: '#3b82f6', r: 4, strokeWidth: 0 }}
          activeDot={{ r: 6, fill: '#2563eb' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default ActivityChart;
