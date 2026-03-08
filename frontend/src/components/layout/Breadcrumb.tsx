import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Breadcrumb navigation component
 */
export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center gap-1 text-sm', className)}>
      <Link
        to="/"
        className="text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Home"
      >
        <Home className="h-4 w-4" />
      </Link>

      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-1">
          <ChevronRight className="h-4 w-4 text-gray-300" />
          {item.to && index < items.length - 1 ? (
            <Link
              to={item.to}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 font-medium truncate max-w-[200px]">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}

export default Breadcrumb;
