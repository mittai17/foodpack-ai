import { apiClient } from '@/lib/api-client';
import type { MaterialDetail, MaterialSummary, Paginated } from './types';

export function listMaterials(params: { search?: string; materialType?: string } = {}) {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.materialType) query.set('materialType', params.materialType);
  query.set('pageSize', '100');
  return apiClient.get<Paginated<MaterialSummary>>(`/materials?${query.toString()}`);
}

export function getMaterial(idOrSlug: string) {
  return apiClient.get<MaterialDetail>(`/materials/${idOrSlug}`);
}
