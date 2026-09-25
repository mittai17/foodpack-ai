import type { CreateProjectInput } from '@foodpack/shared';
import { apiClient } from '@/lib/api-client';
import type { ProjectDetail, ProjectSummary } from './types';

export function listProjects() {
  return apiClient.get<ProjectSummary[]>('/projects');
}

export function getProject(id: string) {
  return apiClient.get<ProjectDetail>(`/projects/${id}`);
}

export function createProject(input: CreateProjectInput) {
  return apiClient.post<ProjectSummary>('/projects', input);
}
