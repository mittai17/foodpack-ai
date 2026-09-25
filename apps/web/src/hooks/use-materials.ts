'use client';

import { useQuery } from '@tanstack/react-query';
import { getMaterial, listMaterials } from '@/lib/api/materials';

export function useMaterials(params: { search?: string; materialType?: string } = {}) {
  return useQuery({
    queryKey: ['materials', params],
    queryFn: () => listMaterials(params),
  });
}

export function useMaterial(idOrSlug: string | undefined) {
  return useQuery({
    queryKey: ['material', idOrSlug],
    queryFn: () => getMaterial(idOrSlug!),
    enabled: !!idOrSlug,
  });
}
