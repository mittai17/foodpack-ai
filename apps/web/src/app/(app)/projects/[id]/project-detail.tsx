'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useProject } from '@/hooks/use-projects';

export function ProjectDetail({ id }: { id: string }) {
  const { data: project, isLoading } = useProject(id);

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (!project) return <p className="text-sm text-muted-foreground">Project not found.</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{project.name}</h1>
        {project.description && <p className="text-sm text-muted-foreground">{project.description}</p>}
      </div>

      <div className="space-y-2">
        {project.analyses.length === 0 && (
          <p className="text-sm text-muted-foreground">No analyses in this project yet.</p>
        )}
        {project.analyses.map((a) => (
          <Link
            key={a.id}
            href={`/analysis/${a.id}`}
            className="flex items-center justify-between rounded-lg border border-border px-4 py-3 text-sm transition-colors hover:bg-secondary/40"
          >
            <div>
              <p className="font-medium">{a.food.name}</p>
              <p className="text-xs text-muted-foreground">{new Date(a.createdAt).toLocaleDateString()}</p>
            </div>
            <Badge variant={a.status === 'COMPLETED' ? 'default' : a.status === 'FAILED' ? 'destructive' : 'secondary'}>
              {a.status}
            </Badge>
          </Link>
        ))}
      </div>
    </div>
  );
}

