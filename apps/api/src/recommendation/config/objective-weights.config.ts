import type { ObjectiveType } from '@foodpack/shared';

export interface ScoreDimensions {
  barrierSuitability: number;
  moistureProtection: number;
  mechanicalSuitability: number;
  sealability: number;
  shelfLifePotential: number;
  cost: number;
  sustainability: number;
  mapSuitability: number;
}

export type DimensionKey = keyof ScoreDimensions;

/**
 * How much each scoring dimension counts toward the overall score, per
 * user-selected objective. Weights are relative (renormalized at runtime
 * over whichever dimensions actually have data), so they don't need to
 * sum to 1 here. Tune these here rather than scattering magic numbers
 * through the scoring service.
 */
export const OBJECTIVE_WEIGHTS: Record<ObjectiveType, ScoreDimensions> = {
  BALANCED: {
    barrierSuitability: 0.16,
    moistureProtection: 0.16,
    mechanicalSuitability: 0.1,
    sealability: 0.06,
    shelfLifePotential: 0.2,
    cost: 0.1,
    sustainability: 0.08,
    mapSuitability: 0.14,
  },
  MAX_SHELF_LIFE: {
    barrierSuitability: 0.19,
    moistureProtection: 0.19,
    mechanicalSuitability: 0.08,
    sealability: 0.05,
    shelfLifePotential: 0.26,
    cost: 0.02,
    sustainability: 0.02,
    mapSuitability: 0.19,
  },
  MIN_COST: {
    barrierSuitability: 0.1,
    moistureProtection: 0.1,
    mechanicalSuitability: 0.08,
    sealability: 0.05,
    shelfLifePotential: 0.15,
    cost: 0.45,
    sustainability: 0.05,
    mapSuitability: 0.02,
  },
  SUSTAINABILITY: {
    barrierSuitability: 0.1,
    moistureProtection: 0.1,
    mechanicalSuitability: 0.05,
    sealability: 0.03,
    shelfLifePotential: 0.15,
    cost: 0.15,
    sustainability: 0.4,
    mapSuitability: 0.02,
  },
};
