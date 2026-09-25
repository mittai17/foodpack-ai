'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateProjectInput } from '@foodpack/shared';
import { createProject, getProject, listProjects } from '@/lib/api/projects';

export function useProjects() {
  return useQuery({ queryKey: ['projects'], queryFn: listProjects });
}

export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => getProject(id!),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProjectInput) => createProject(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });
}
