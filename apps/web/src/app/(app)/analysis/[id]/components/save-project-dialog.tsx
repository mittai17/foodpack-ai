'use client';

import { useState } from 'react';
import { FolderKanban, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useProjects, useCreateProject } from '@/hooks/use-projects';
import { useAttachAnalysisToProject } from '@/hooks/use-analysis';
import { cn } from '@/lib/utils';

export function SaveProjectDialog({
  analysisId,
  currentProjectId,
}: {
  analysisId: string;
  currentProjectId?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const { data: projects } = useProjects();
  const createProject = useCreateProject();
  const attach = useAttachAnalysisToProject();

  async function handleAttach(projectId: string) {
    try {
      await attach.mutateAsync({ id: analysisId, projectId });
      toast.success('Saved to project.');
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save to project.');
    }
  }

  async function handleCreateAndAttach() {
    if (!newProjectName.trim()) return;
    try {
      const project = await createProject.mutateAsync({ name: newProjectName });
      await attach.mutateAsync({ id: analysisId, projectId: project.id });
      toast.success(`Saved to new project "${project.name}".`);
      setNewProjectName('');
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not create project.');
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <FolderKanban className="h-4 w-4" />
        Save Project
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save to a project</DialogTitle>
          <DialogDescription>Group this analysis with related ones.</DialogDescription>
        </DialogHeader>

        <div className="space-y-1 max-h-64 overflow-y-auto">
          {(projects ?? []).length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">No projects yet — create one below.</p>
          )}
          {(projects ?? []).map((project) => (
            <button
              key={project.id}
              type="button"
              onClick={() => handleAttach(project.id)}
              disabled={attach.isPending}
              className={cn(
                'flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-colors',
                currentProjectId === project.id
                  ? 'border-primary bg-accent text-accent-foreground'
                  : 'border-border hover:bg-secondary/40',
              )}
            >
              <span>{project.name}</span>
              {currentProjectId === project.id && <span className="text-xs text-primary">Current</span>}
            </button>
          ))}
        </div>

        <div className="flex gap-2 border-t border-border pt-3">
          <Input
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="New project name"
          />
          <Button
            variant="outline"
            onClick={handleCreateAndAttach}
            disabled={!newProjectName.trim() || createProject.isPending}
          >
            <Plus className="h-4 w-4" />
            Create
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
