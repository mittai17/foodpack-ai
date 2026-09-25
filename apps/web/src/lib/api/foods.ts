import { apiClient } from '@/lib/api-client';
import type { FoodCategory, FoodDetail, FoodSummary, Paginated } from './types';

export function listFoods(params: { search?: string; category?: string; page?: number } = {}) {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.category) query.set('category', params.category);
  if (params.page) query.set('page', String(params.page));
  query.set('pageSize', '100');
  return apiClient.get<Paginated<FoodSummary>>(`/foods?${query.toString()}`);
}

export function getFood(idOrSlug: string) {
  return apiClient.get<FoodDetail>(`/foods/${idOrSlug}`);
}

export function listFoodCategories() {
  return apiClient.get<FoodCategory[]>('/foods/categories');
}
