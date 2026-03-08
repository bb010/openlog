import { Component, type ReactNode, type ErrorInfo } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Class component that catches rendering errors
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
          <div className="rounded-full bg-destructive/10 p-4 mb-4">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
          <Alert variant="destructive" className="max-w-md mb-6 text-left">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {import.meta.env.DEV
                ? this.state.error?.message
                : 'An unexpected error occurred. Please try again.'}
            </AlertDescription>
          </Alert>
          <Button onClick={this.handleReset} variant="outline">
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
