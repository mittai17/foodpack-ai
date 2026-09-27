import type {
  ConfidenceLevel,
  ObjectiveType,
  ProductState,
  StorageType,
  TransportType,
  AnalysisStatus,
  EnvironmentalDataSource,
} from './enums';

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: { code: string; message: string; details?: unknown };
  meta?: { path: string; timestamp: string };
}

export interface Paginated<T> {
  items: T[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
}

export interface SourceRef {
  id: string;
  citation: string;
  publication?: string | null;
  year?: number | null;
  url?: string | null;
}

export interface FoodSummary {
  id: string;
  slug: string;
  name: string;
  commonNames: string[];
  scientificName?: string | null;
  imageUrl?: string | null;
  isFreshProduce: boolean;
  category: { id: string; name: string; slug: string };
}

export interface FoodDetail extends FoodSummary {
  description?: string | null;
  properties: Array<{
    propertyType: string;
    value?: number | null;
    unit?: string | null;
    minValue?: number | null;
    maxValue?: number | null;
    confidence: ConfidenceLevel;
    source?: SourceRef | null;
    notes?: string | null;
  }>;
  storageConditions: Array<{
    storageType: StorageType;
    minTempC?: number | null;
    maxTempC?: number | null;
    minRH?: number | null;
    maxRH?: number | null;
    source?: SourceRef | null;
  }>;
  shelfLifeData: Array<{
    storageType: StorageType;
    minDays?: number | null;
    maxDays?: number | null;
    packagingContext?: string | null;
    confidence: ConfidenceLevel;
    source?: SourceRef | null;
  }>;
}

export interface PackagingMaterialSummary {
  id: string;
  slug: string;
  name: string;
  materialType: string;
  recyclable?: boolean | null;
  monoMaterial?: boolean | null;
  biodegradable?: boolean | null;
}

export interface RecommendationCandidate {
  id: string;
  rank: number;
  isRecommended: boolean;
  overallScore: number;
  structure: {
    id: string;
    name: string;
    structureType: string;
    supportsMap: boolean;
    layers: Array<{
      order: number;
      layerRole: string;
      material: PackagingMaterialSummary;
      thicknessMinMicron?: number | null;
      thicknessMaxMicron?: number | null;
    }>;
  } | null;
  scoreBreakdown: Record<string, number>;
  estimatedShelfLifeMinDays?: number | null;
  estimatedShelfLifeMaxDays?: number | null;
  shelfLifeConfidence: ConfidenceLevel;
  estimatedCostMin?: number | null;
  estimatedCostMax?: number | null;
  costUnit?: string | null;
  sustainabilityNotes?: string | null;
  explanation: string[];
  aiExplanation?: string | null;
}

export interface RequirementSummary {
  targetOtrMin?: number | null;
  targetOtrMax?: number | null;
  otrUnit?: string | null;
  targetWvtrMin?: number | null;
  targetWvtrMax?: number | null;
  wvtrUnit?: string | null;
  mapRecommended?: boolean | null;
  recommendedO2Min?: number | null;
  recommendedO2Max?: number | null;
  recommendedCo2Min?: number | null;
  recommendedCo2Max?: number | null;
  sealabilityRequired: boolean;
  mechanicalNotes?: string | null;
  assumptions: string[];
  limitingFactors: string[];
  dataConfidence: ConfidenceLevel;
}

export interface AnalysisDetail {
  id: string;
  status: AnalysisStatus;
  food: FoodSummary;
  productState: ProductState;
  storageType: StorageType;
  transportType: TransportType;
  targetShelfLifeDays: number;
  objective: ObjectiveType;
  requirement: RequirementSummary | null;
  recommendations: RecommendationCandidate[];
  createdAt: string;
}
