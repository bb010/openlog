import { Badge } from '@/components/ui/badge';

interface FilterBadgeProps {
  count: number;
  className?: string;
}

/**
 * Badge showing the number of active filters — uses shadcn Badge
 */
export function FilterBadge({ count, className }: FilterBadgeProps) {
  if (count === 0) return null;

  return (
    <Badge className={className}>
      {count > 9 ? '9+' : count}
    </Badge>
  );
}

export default FilterBadge;
