'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FolderKanban, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useCreateProject, useProjects } from '@/hooks/use-projects';
import { toast } from 'sonner';

export default function ProjectsPage() {
  const { data: projects, isLoading } = useProjects();
  const createProject = useCreateProject();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  async function handleCreate() {
    if (!name.trim()) return;
    try {
      await createProject.mutateAsync({ name, description: description || undefined });
      setName('');
      setDescription('');
      setCreating(false);
      toast.success('Project created.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not create project.');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">My Projects</h1>
          <p className="text-sm text-muted-foreground">Group related analyses together.</p>
        </div>
        <Button onClick={() => setCreating((v) => !v)}>
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {creating && (
        <Card>
          <CardContent className="space-y-3 px-6 py-6">
            <div className="space-y-1.5">
              <Label htmlFor="project-name">Name</Label>
              <Input id="project-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Q3 Mango Export Line" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="project-description">Description</Label>
              <Textarea
                id="project-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional"
              />
            </div>
            <Button onClick={handleCreate} disabled={createProject.isPending || !name.trim()}>
              Create
            </Button>
          </CardContent>
        </Card>
      )}

      {isLoading && <Skeleton className="h-32 w-full" />}

      {!isLoading && (projects?.length ?? 0) === 0 && !creating && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <FolderKanban className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No projects yet.</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {(projects ?? []).map((project) => (
          <Link key={project.id} href={`/projects/${project.id}`}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardContent className="space-y-1 px-5 py-5">
                <p className="text-sm font-semibold">{project.name}</p>
                {project.description && (
                  <p className="line-clamp-2 text-xs text-muted-foreground">{project.description}</p>
                )}
                <p className="pt-1 text-xs text-muted-foreground">
                  {project._count?.analyses ?? 0} analyses
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
