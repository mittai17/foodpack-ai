'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateAnalysisInput } from '@foodpack/shared';
import { createAnalysis, getAnalysis, listAnalyses, updateAnalysisProject } from '@/lib/api/analysis';

export function useAnalyses(page = 1) {
  return useQuery({
    queryKey: ['analyses', page],
    queryFn: () => listAnalyses(page),
  });
}

export function useAnalysis(id: string | undefined) {
  return useQuery({
    queryKey: ['analysis', id],
    queryFn: () => getAnalysis(id!),
    enabled: !!id,
  });
}

export function useCreateAnalysis() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAnalysisInput) => createAnalysis(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analyses'] });
    },
  });
}

export function useAttachAnalysisToProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, projectId }: { id: string; projectId: string | null }) =>
      updateAnalysisProject(id, projectId),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['analysis', id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
