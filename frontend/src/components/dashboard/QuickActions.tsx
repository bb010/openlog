import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, FolderOpen, FileText, ChevronRight, Loader2 } from 'lucide-react';
import { useProjectsList } from '@/hooks/useProjects';
import { useCreateEntry } from '@/hooks/useEntries';
import { EntryForm } from '@/components/entries/EntryForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import type { CreateEntryFormData } from '@/schemas/entry';

type Step = 'pick-project' | 'write-entry';

/**
 * Quick action buttons on the dashboard.
 * "Log Entry" opens a 2-step dialog: pick project → write entry.
 */
export function QuickActions() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('pick-project');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedProjectName, setSelectedProjectName] = useState<string>('');

  const { data: projectsData, isLoading: projectsLoading } = useProjectsList(1, 50);
  const createEntry = useCreateEntry(selectedProjectId ?? '');

  const handleProjectSelect = (id: string, name: string) => {
    setSelectedProjectId(id);
    setSelectedProjectName(name);
    setStep('write-entry');
  };

  const handleEntrySubmit = async (data: CreateEntryFormData) => {
    if (!selectedProjectId) return;
    await createEntry.mutateAsync(data);
    setOpen(false);
    navigate(`/projects/${selectedProjectId}/entries`);
  };

  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    if (!val) {
      // Reset state on close
      setTimeout(() => {
        setStep('pick-project');
        setSelectedProjectId(null);
        setSelectedProjectName('');
      }, 200);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* New Project */}
        <Link
          to="/projects/new"
          className="flex items-center gap-3 p-4 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors group"
        >
          <div className="rounded-lg bg-white/20 p-2 group-hover:bg-white/30 transition-colors">
            <Plus className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">New Project</p>
            <p className="text-xs opacity-70">Start tracking</p>
          </div>
        </Link>

        {/* Browse Projects */}
        <Link
          to="/projects"
          className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:bg-muted/60 transition-colors group"
        >
          <div className="rounded-lg bg-muted p-2 group-hover:bg-muted/80 transition-colors">
            <FolderOpen className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold">Browse Projects</p>
            <p className="text-xs text-muted-foreground">View all projects</p>
          </div>
        </Link>

        {/* Log Entry — triggers dialog */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:bg-muted/60 transition-colors group text-left"
        >
          <div className="rounded-lg bg-emerald-100 dark:bg-emerald-900/40 p-2 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/60 transition-colors">
            <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-semibold">Log Entry</p>
            <p className="text-xs text-muted-foreground">Quick log to any project</p>
          </div>
        </button>
      </div>

      {/* Log Entry Dialog */}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          {step === 'pick-project' ? (
            <>
              <DialogHeader>
                <DialogTitle>Choose a Project</DialogTitle>
                <DialogDescription>Select the project you want to log an entry for.</DialogDescription>
              </DialogHeader>

              {projectsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : !projectsData?.items.length ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-muted-foreground mb-3">No projects yet.</p>
                  <Link
                    to="/projects/new"
                    className="text-sm text-primary underline underline-offset-4"
                    onClick={() => setOpen(false)}
                  >
                    Create your first project →
                  </Link>
                </div>
              ) : (
                <div className="space-y-1 max-h-72 overflow-y-auto -mx-1 px-1">
                  {projectsData.items.map((project) => (
                    <button
                      key={project.id}
                      type="button"
                      onClick={() => handleProjectSelect(project.id, project.name)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-muted transition-colors group"
                    >
                      <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
                        <FolderOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{project.name}</p>
                        {project.description && (
                          <p className="text-xs text-muted-foreground truncate">{project.description}</p>
                        )}
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>New Log Entry</DialogTitle>
                <DialogDescription>
                  Logging to{' '}
                  <span className="font-semibold text-foreground">{selectedProjectName}</span>
                </DialogDescription>
              </DialogHeader>

              <EntryForm
                mode="create"
                onSubmit={handleEntrySubmit}
                onCancel={() => setStep('pick-project')}
                isLoading={createEntry.isPending}
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default QuickActions;
