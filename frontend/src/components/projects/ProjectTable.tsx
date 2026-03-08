import { Link } from 'react-router-dom';
import { Edit2, Trash2, FileText, ChevronLeft, ChevronRight, FolderOpen } from 'lucide-react';
import type { Project, PaginatedResponse } from '@/types/models';
import { formatDate } from '@/utils/formatDate';
import { Button } from '@/components/ui/button';
import { SkeletonTableRow } from '@/components/common/Skeleton';

interface ProjectTableProps {
  data?: PaginatedResponse<Project>;
  isLoading?: boolean;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  page: number;
  onPageChange: (page: number) => void;
}

/**
 * Paginated table of projects with actions
 */
export function ProjectTable({
  data,
  isLoading,
  onEdit,
  onDelete,
  page,
  onPageChange,
}: ProjectTableProps) {
  const projects = data?.items || [];
  const totalPages = data?.totalPages || 1;

  if (isLoading) {
    return (
      <div className="overflow-hidden">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Path</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Created</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonTableRow key={i} cols={4} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-muted p-5 mb-4">
          <FolderOpen className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-base font-semibold mb-1">No projects yet</p>
        <p className="text-sm text-muted-foreground mb-4">Create your first project to start logging</p>
        <Link to="/projects/new">
          <Button size="sm">
            Create Project
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Project
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                Path
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                Created
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {projects.map((project) => (
              <tr key={project.id} className="hover:bg-muted/40 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <FolderOpen className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <Link
                        to={`/projects/${project.id}`}
                        className="text-sm font-semibold hover:text-primary transition-colors truncate block"
                      >
                        {project.name}
                      </Link>
                      {project.description && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5 max-w-[200px]">
                          {project.description}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded font-mono truncate block max-w-[200px]">
                    {project.path}
                  </code>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="text-sm text-muted-foreground">{formatDate(project.createdAt)}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link to={`/projects/${project.id}`}>
                      <Button variant="ghost" size="sm">
                        <FileText className="h-4 w-4" />
                        <span className="hidden sm:inline">Entries</span>
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(project)}
                    >
                      <Edit2 className="h-4 w-4" />
                      <span className="hidden sm:inline">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => onDelete(project)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="hidden sm:inline">Delete</span>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Page {page} of {totalPages} · {data?.total} projects
          </p>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectTable;
