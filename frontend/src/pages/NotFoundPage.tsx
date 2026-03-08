import { Link } from 'react-router-dom';
import { Home, FileSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * 404 Not Found page
 */
export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center px-4">
      <div className="rounded-full bg-muted p-6 mb-6">
        <FileSearch className="h-12 w-12 text-muted-foreground" />
      </div>
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <h2 className="text-xl font-semibold text-muted-foreground mb-3">Page not found</h2>
      <p className="text-muted-foreground mb-8 max-w-sm">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/">
        <Button>
          <Home className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </Link>
    </div>
  );
}

export default NotFoundPage;
