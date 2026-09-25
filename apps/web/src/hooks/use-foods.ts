'use client';

import { useQuery } from '@tanstack/react-query';
import { getFood, listFoodCategories, listFoods } from '@/lib/api/foods';

export function useFoods(params: { search?: string; category?: string } = {}) {
  return useQuery({
    queryKey: ['foods', params],
    queryFn: () => listFoods(params),
  });
}

export function useFood(idOrSlug: string | undefined) {
  return useQuery({
    queryKey: ['food', idOrSlug],
    queryFn: () => getFood(idOrSlug!),
    enabled: !!idOrSlug,
  });
}

export function useFoodCategories() {
  return useQuery({
    queryKey: ['food-categories'],
    queryFn: listFoodCategories,
    staleTime: 5 * 60_000,
  });
}
