import { type ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { Card, CardContent } from '@/components/ui/card';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  iconBg?: string;
  subtitle?: string;
  className?: string;
}

/**
 * Statistics display card for the dashboard
 */
export function StatsCard({ title, value, icon, iconBg = 'bg-primary/10', subtitle, className }: StatsCardProps) {
  return (
    <Card className={cn(className)}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className={cn('rounded-xl p-3', iconBg)}>
            {icon}
          </div>
        </div>
        <div className="mt-4">
          <p className="text-3xl font-bold tracking-tight">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          <p className="text-sm font-medium text-muted-foreground mt-1">{title}</p>
          {subtitle && <p className="text-xs text-muted-foreground/70 mt-0.5">{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export default StatsCard;
