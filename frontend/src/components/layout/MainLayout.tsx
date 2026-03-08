import { type ReactNode } from 'react';
import { Header } from './Header';

interface MainLayoutProps {
  children: ReactNode;
}

/**
 * Main layout wrapper providing header and main content area
 */
export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

export default MainLayout;
