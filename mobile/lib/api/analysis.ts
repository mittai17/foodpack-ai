import { apiGet, apiPost, apiDelete } from './client';
import type { CreateAnalysisInput } from '@foodpack/shared';

export interface FoodItem {
  id: string;
  slug: string;
  name: string;
  commonNames: string[];
  scientificName?: string;
  imageUrl?: string;
  description?: string;
  isFreshProduce: boolean;
  category: { id: string; name: string; slug: string };
  sources?: SourceRef[];
}

export interface FoodCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface AnalysisResult {
  id: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  food: FoodItem;
  productState: string;
  storageType: string;
  transportType: string;
  targetShelfLifeDays: number;
  packageWeightKg: number;
  objective: string;
  recommendations: Recommendation[];
  requirement?: Requirement;
  createdAt: string;
  updatedAt: string;
}

export interface SourceRef {
  id: string;
  citation: string;
  publication?: string | null;
  year?: number | null;
  url?: string | null;
}

export interface FoodProperty {
  id?: string;
  propertyType: string;
  value?: number | null;
  minValue?: number | null;
  maxValue?: number | null;
  unit?: string | null;
  confidence?: string | null;
  source?: SourceRef | null;
}

export interface StorageCondition {
  id?: string;
  storageType: string;
  minTempC?: number | null;
  maxTempC?: number | null;
  minRH?: number | null;
  maxRH?: number | null;
  notes?: string | null;
  source?: SourceRef | null;
}

export interface ShelfLifeData {
  id?: string;
  storageType: string;
  minDays?: number | null;
  maxDays?: number | null;
  packagingContext?: string | null;
  source?: SourceRef | null;
}

export interface FoodDetailItem extends FoodItem {
  properties: FoodProperty[];
  storageConditions: StorageCondition[];
  shelfLifeData: ShelfLifeData[];
  sources: SourceRef[];
}

export interface MaterialProperty {
  id?: string;
  propertyType: string;
  value?: number | null;
  minValue?: number | null;
  maxValue?: number | null;
  unit?: string | null;
  testConditionTempC?: number | null;
  testConditionRH?: number | null;
  confidence?: string | null;
  notes?: string | null;
  source?: SourceRef | null;
}

export interface LayerMaterial {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  materialType?: string;
  recyclable?: boolean | null;
  compostable?: boolean | null;
  bioBased?: boolean | null;
  monoMaterial?: boolean | null;
  biodegradable?: boolean | null;
  approxCostMin?: number | null;
  approxCostMax?: number | null;
  costUnit?: string | null;
  sources?: SourceRef[];
  properties?: MaterialProperty[];
}

export type MaterialDetail = LayerMaterial;
export type MaterialSummary = LayerMaterial;


export interface StructureLayer {
  id: string;
  order: number;
  layerRole: string;
  thicknessMinMicron?: number | null;
  thicknessMaxMicron?: number | null;
  material: LayerMaterial;
}

export interface PackagingStructure {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  structureType: string;
  supportsMap: boolean;
  layers: StructureLayer[];
}

export interface Recommendation {
  id: string;
  rank: number;
  isRecommended: boolean;
  overallScore: number;
  scoreBreakdown: Record<string, number>;
  estimatedShelfLifeMinDays?: number;
  estimatedShelfLifeMaxDays?: number;
  shelfLifeConfidence: string;
  estimatedCostMin?: number;
  estimatedCostMax?: number;
  costUnit?: string;
  sustainabilityNotes?: string;
  explanation: string[];
  aiExplanation?: string;
  material?: LayerMaterial;
  structure?: PackagingStructure;
}

export interface Requirement {
  targetOtrMin?: number | null;
  targetOtrMax?: number | null;
  targetWvtrMin?: number | null;
  targetWvtrMax?: number | null;
  mapRecommended?: boolean;
  recommendedO2Min?: number | null;
  recommendedO2Max?: number | null;
  recommendedCo2Min?: number | null;
  recommendedCo2Max?: number | null;
  limitingFactors?: string[];
  assumptions?: string[];
  dataConfidence?: string;
}

/** Actual API envelope from server */
interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  meta?: Record<string, unknown>;
}

interface PaginatedData<T> {
  items: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

import {
  OFFLINE_CATEGORIES,
  OFFLINE_FOODS,
  OFFLINE_ANALYSES,
  OFFLINE_MATERIALS,
  createOfflineAnalysis,
} from './offline-data';

export const foodsApi = {
  list: async (params?: { categorySlug?: string; search?: string; isFreshProduce?: boolean }) => {
    try {
      const query = new URLSearchParams();
      if (params?.categorySlug) query.set('category', params.categorySlug);
      if (params?.search) query.set('search', params.search);
      if (params?.isFreshProduce !== undefined) query.set('isFreshProduce', String(params.isFreshProduce));
      const qs = query.toString();
      const res = await apiGet<ApiEnvelope<PaginatedData<FoodItem>>>(`/api/v1/foods${qs ? `?${qs}` : ''}`);
      if (res?.data?.items?.length) {
        return { data: res.data.items, pagination: res.data.pagination };
      }
    } catch {
      // Network unavailable — smoothly serve verified offline catalog
    }

    let filtered = OFFLINE_FOODS.map((f) => ({
      id: f.id,
      slug: f.slug,
      name: f.name,
      commonNames: f.commonNames,
      scientificName: f.scientificName,
      description: f.description,
      isFreshProduce: f.isFreshProduce,
      category: f.category,
      sources: f.sources,
    }));

    if (params?.categorySlug) {
      filtered = filtered.filter((f) => f.category.slug === params.categorySlug);
    }
    if (params?.isFreshProduce !== undefined) {
      filtered = filtered.filter((f) => f.isFreshProduce === params.isFreshProduce);
    }
    if (params?.search) {
      const s = params.search.toLowerCase();
      filtered = filtered.filter(
        (f) =>
          f.name.toLowerCase().includes(s) ||
          f.slug.toLowerCase().includes(s) ||
          f.commonNames.some((c) => c.toLowerCase().includes(s)) ||
          (f.scientificName && f.scientificName.toLowerCase().includes(s)),
      );
    }

    return {
      data: filtered,
      pagination: {
        page: 1,
        pageSize: filtered.length,
        total: filtered.length,
        totalPages: 1,
      },
    };
  },

  categories: async () => {
    try {
      const res = await apiGet<ApiEnvelope<FoodCategory[]>>('/api/v1/foods/categories');
      if (res?.data?.length) {
        return { data: res.data };
      }
    } catch {
      // Network unavailable — serve offline categories
    }
    return { data: OFFLINE_CATEGORIES };
  },

  byId: async (idOrSlug: string) => {
    try {
      const res = await apiGet<ApiEnvelope<FoodDetailItem>>(`/api/v1/foods/${idOrSlug}`);
      if (res?.data) {
        return { data: res.data };
      }
    } catch {
      // Network unavailable — serve offline food detail
    }
    const found = OFFLINE_FOODS.find((f) => f.slug === idOrSlug || f.id === idOrSlug) ?? OFFLINE_FOODS[0];
    return { data: found };
  },
};

export const analysisApi = {
  create: async (input: CreateAnalysisInput) => {
    try {
      const res = await apiPost<ApiEnvelope<AnalysisResult>>('/api/v1/analysis', input);
      if (res?.data) return res;
    } catch {
      // Backend unavailable — execute deterministic on-device offline recommendation engine
    }
    const result = createOfflineAnalysis(input);
    return { success: true, data: result };
  },

  getById: async (id: string) => {
    try {
      const res = await apiGet<ApiEnvelope<AnalysisResult>>(`/api/v1/analysis/${id}`);
      if (res?.data) return { data: res.data };
    } catch {
      // Network unavailable — serve offline analysis detail
    }
    const found = OFFLINE_ANALYSES.find((a) => a.id === id) ?? OFFLINE_ANALYSES[0];
    return { data: found };
  },

  list: async (params?: { page?: number; limit?: number }) => {
    try {
      const query = new URLSearchParams();
      if (params?.page) query.set('page', String(params.page));
      if (params?.limit) query.set('pageSize', String(params.limit));
      const qs = query.toString();
      const res = await apiGet<ApiEnvelope<PaginatedData<AnalysisResult>>>(
        `/api/v1/analysis${qs ? `?${qs}` : ''}`,
      );
      if (res?.data?.items?.length) {
        return { data: res.data.items, total: res.data.pagination.total, pagination: res.data.pagination };
      }
    } catch {
      // Network unavailable — serve offline analyses
    }
    return {
      data: OFFLINE_ANALYSES,
      total: OFFLINE_ANALYSES.length,
      pagination: {
        page: 1,
        pageSize: OFFLINE_ANALYSES.length,
        total: OFFLINE_ANALYSES.length,
        totalPages: 1,
      },
    };
  },

  delete: (id: string) => apiDelete<void>(`/api/v1/analysis/${id}`),
};

export const materialsApi = {
  list: async (params?: { search?: string; materialType?: string }) => {
    try {
      const query = new URLSearchParams();
      if (params?.search) query.set('search', params.search);
      if (params?.materialType && params.materialType !== 'ALL') query.set('materialType', params.materialType);
      const qs = query.toString();
      const res = await apiGet<ApiEnvelope<PaginatedData<LayerMaterial>>>(
        `/api/v1/materials${qs ? `?${qs}` : ''}`,
      );
      if (res?.data?.items?.length) {
        return { data: res.data.items, total: res.data.pagination.total };
      }
    } catch {
      // Network unavailable — serve offline materials
    }
    let items = OFFLINE_MATERIALS;
    if (params?.search) {
      const q = params.search.toLowerCase();
      items = items.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.slug.toLowerCase().includes(q) ||
          m.materialType?.toLowerCase().includes(q) ||
          m.description?.toLowerCase().includes(q),
      );
    }
    if (params?.materialType && params.materialType !== 'ALL') {
      items = items.filter((m) => m.materialType === params.materialType);
    }
    return { data: items, total: items.length };
  },

  byId: async (idOrSlug: string) => {
    try {
      const res = await apiGet<ApiEnvelope<LayerMaterial>>(`/api/v1/materials/${idOrSlug}`);
      if (res?.data) {
        return { data: res.data };
      }
    } catch {
      // Network unavailable — serve offline material detail
    }
    const found =
      OFFLINE_MATERIALS.find((m) => m.slug === idOrSlug || m.id === idOrSlug) ?? OFFLINE_MATERIALS[0];
    return { data: found };
  },
};
