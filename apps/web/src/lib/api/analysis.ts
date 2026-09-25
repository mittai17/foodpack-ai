import type { CreateAnalysisInput } from '@foodpack/shared';
import { apiClient } from '@/lib/api-client';
import type { AnalysisDetail, Paginated } from './types';

export function createAnalysis(input: CreateAnalysisInput) {
  return apiClient.post<AnalysisDetail>('/analysis', input);
}

export function getAnalysis(id: string) {
  return apiClient.get<AnalysisDetail>(`/analysis/${id}`);
}

export function listAnalyses(page = 1) {
  return apiClient.get<Paginated<AnalysisDetail>>(`/analysis?page=${page}&pageSize=20`);
}

export function updateAnalysisProject(id: string, projectId: string | null) {
  return apiClient.patch<AnalysisDetail>(`/analysis/${id}`, { projectId });
}
