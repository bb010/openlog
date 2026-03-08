import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { lazy, Suspense } from 'react';

import { queryClient } from '@/config/queryClient';
import { UIProvider } from '@/context/UIContext';
import { FilterProvider } from '@/context/FilterContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { MainLayout } from '@/components/layout/MainLayout';
import { Toaster } from '@/components/ui/sonner';
import { PageLoading } from '@/components/common/LoadingSpinner';

const Dashboard = lazy(() => import('@/pages/Dashboard').then(m => ({ default: m.Dashboard })));
const ProjectsPage = lazy(() => import('@/pages/ProjectsPage').then(m => ({ default: m.ProjectsPage })));
const CreateProjectPage = lazy(() => import('@/pages/CreateProjectPage').then(m => ({ default: m.CreateProjectPage })));
const EditProjectPage = lazy(() => import('@/pages/EditProjectPage').then(m => ({ default: m.EditProjectPage })));
const ProjectDetailPage = lazy(() => import('@/pages/ProjectDetailPage').then(m => ({ default: m.ProjectDetailPage })));
const EntriesPage = lazy(() => import('@/pages/EntriesPage').then(m => ({ default: m.EntriesPage })));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

function AppRoutes() {
  return (
    <MainLayout>
      <Suspense fallback={<PageLoading />}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/new" element={<CreateProjectPage />} />
          <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
          <Route path="/projects/:projectId/edit" element={<EditProjectPage />} />
          <Route path="/projects/:projectId/entries" element={<EntriesPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </MainLayout>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <UIProvider>
            <FilterProvider>
              <BrowserRouter>
                <AppRoutes />
                <Toaster position="top-right" richColors closeButton />
              </BrowserRouter>
            </FilterProvider>
          </UIProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
