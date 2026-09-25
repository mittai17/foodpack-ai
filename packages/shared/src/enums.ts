// Mirrors the Prisma enums in apps/api/prisma/schema.prisma.
// Kept here (not imported from @prisma/client) so the web app never has to
// depend on the Prisma runtime.

export const ROLES = ['USER', 'FOOD_EXPERT', 'PACKAGING_EXPERT', 'ADMIN'] as const;
export type Role = (typeof ROLES)[number];

export const OBJECTIVES = [
  'MAX_SHELF_LIFE',
  'MIN_COST',
  'SUSTAINABILITY',
  'BALANCED',
] as const;
export type ObjectiveType = (typeof OBJECTIVES)[number];

export const STORAGE_TYPES = ['AMBIENT', 'CHILLED', 'FROZEN'] as const;
export type StorageType = (typeof STORAGE_TYPES)[number];

export const TRANSPORT_TYPES = ['LOCAL', 'LONG_DISTANCE', 'EXPORT'] as const;
export type TransportType = (typeof TRANSPORT_TYPES)[number];

export const PRODUCT_STATES = ['FRESH', 'CUT_READY_TO_EAT', 'PROCESSED'] as const;
export type ProductState = (typeof PRODUCT_STATES)[number];

export const CONFIDENCE_LEVELS = ['HIGH', 'MEDIUM', 'LOW'] as const;
export type ConfidenceLevel = (typeof CONFIDENCE_LEVELS)[number];

export const ANALYSIS_STATUSES = [
  'PENDING',
  'PROCESSING',
  'COMPLETED',
  'FAILED',
] as const;
export type AnalysisStatus = (typeof ANALYSIS_STATUSES)[number];

export const OBJECTIVE_LABELS: Record<ObjectiveType, string> = {
  MAX_SHELF_LIFE: 'Maximum shelf life',
  MIN_COST: 'Lowest cost',
  SUSTAINABILITY: 'More sustainable',
  BALANCED: 'Balanced',
};

export const STORAGE_LABELS: Record<StorageType, string> = {
  AMBIENT: 'Ambient / room temperature',
  CHILLED: 'Chilled (refrigerated)',
  FROZEN: 'Frozen',
};

export const TRANSPORT_LABELS: Record<TransportType, string> = {
  LOCAL: 'Local / short distance',
  LONG_DISTANCE: 'Long distance (domestic)',
  EXPORT: 'Export / international',
};

export const PRODUCT_STATE_LABELS: Record<ProductState, string> = {
  FRESH: 'Fresh',
  CUT_READY_TO_EAT: 'Cut / ready-to-eat',
  PROCESSED: 'Processed',
};
