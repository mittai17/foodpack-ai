import type {
  AnalysisStatus,
  ConfidenceLevel,
  ObjectiveType,
  ProductState,
  StorageType,
  TransportType,
} from '@foodpack/shared';

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

export interface FoodCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
}

export interface FoodSummary {
  id: string;
  slug: string;
  name: string;
  commonNames: string[];
  scientificName?: string | null;
  imageUrl?: string | null;
  isFreshProduce: boolean;
  description?: string | null;
  category: FoodCategory;
  sources?: SourceRef[];
  storageConditions?: FoodStorageCondition[];
}

export interface FoodProperty {
  propertyType: string;
  value?: number | null;
  minValue?: number | null;
  maxValue?: number | null;
  unit?: string | null;
  confidence: ConfidenceLevel;
  notes?: string | null;
  source?: SourceRef | null;
}

export interface FoodStorageCondition {
  storageType: StorageType;
  minTempC?: number | null;
  maxTempC?: number | null;
  minRH?: number | null;
  maxRH?: number | null;
  notes?: string | null;
  source?: SourceRef | null;
}

export interface FoodShelfLife {
  storageType: StorageType;
  minDays?: number | null;
  maxDays?: number | null;
  packagingContext?: string | null;
  confidence: ConfidenceLevel;
  source?: SourceRef | null;
}

export interface FoodDetail extends FoodSummary {
  properties: FoodProperty[];
  storageConditions: FoodStorageCondition[];
  shelfLifeData: FoodShelfLife[];
  sources: SourceRef[];
}

export interface MaterialSummary {
  id: string;
  slug: string;
  name: string;
  materialType: string;
  description?: string | null;
  recyclable?: boolean | null;
  monoMaterial?: boolean | null;
  biodegradable?: boolean | null;
  approxCostMin?: number | null;
  approxCostMax?: number | null;
  costUnit?: string | null;
  sources?: SourceRef[];
  properties?: MaterialProperty[];
}

export interface MaterialProperty {
  propertyType: string;
  value?: number | null;
  minValue?: number | null;
  maxValue?: number | null;
  unit?: string | null;
  testConditionTempC?: number | null;
  testConditionRH?: number | null;
  confidence: ConfidenceLevel;
  notes?: string | null;
  source?: SourceRef | null;
}

export interface MaterialDetail extends MaterialSummary {
  properties: MaterialProperty[];
  sources: SourceRef[];
}

export interface StructureLayer {
  order: number;
  layerRole: string;
  thicknessMinMicron?: number | null;
  thicknessMaxMicron?: number | null;
  material: MaterialSummary;
}

export interface RecommendationCandidate {
  id: string;
  rank: number;
  isRecommended: boolean;
  overallScore: number;
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
  structure: {
    id: string;
    slug: string;
    name: string;
    structureType: string;
    description?: string | null;
    supportsMap: boolean;
    microPerforated: boolean;
    layers: StructureLayer[];
  } | null;
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
  projectId?: string | null;
  food: FoodSummary;
  productState: ProductState;
  storageType: StorageType;
  transportType: TransportType;
  targetShelfLifeDays: number;
  packageWeightKg: number;
  objective: ObjectiveType;
  errorMessage?: string | null;
  requirement: RequirementSummary | null;
  recommendations: RecommendationCandidate[];
  createdAt: string;
}

export interface ProjectSummary {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { analyses: number };
}

export interface ProjectDetail extends ProjectSummary {
  analyses: Array<AnalysisDetail & { food: FoodSummary }>;
}
