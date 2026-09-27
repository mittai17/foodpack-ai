import { Injectable } from '@nestjs/common';
import type { ConfidenceLevel } from '@prisma/client';
import type { ObjectiveType, StorageType, TransportType } from '@foodpack/shared';
import {
  OBJECTIVE_WEIGHTS,
  type DimensionKey,
  type ScoreDimensions,
} from '../config/objective-weights.config';
import type { StructureCandidate } from './candidate-generator.service';
import type { DerivedRequirement } from './requirement-engine.service';
import { ScoringService } from './scoring.service';
import { ShelfLifeService } from './shelf-life.service';
import { CostService } from './cost.service';
import { SustainabilityService } from './sustainability.service';
import { ExplanationService } from './explanation.service';
import { clamp } from './scoring-math';
import type { FoodShelfLifeData } from '@prisma/client';
import { LayerRole } from '../config/property-types';

export interface RankedRecommendation {
  structureId: string;
  primaryMaterialId: string | null;
  rank: number;
  isRecommended: boolean;
  overallScore: number;
  scoreBreakdown: ScoreDimensions;
  estimatedShelfLifeMinDays: number | null;
  estimatedShelfLifeMaxDays: number | null;
  shelfLifeConfidence: ConfidenceLevel;
  estimatedCostMin: number | null;
  estimatedCostMax: number | null;
  costUnit: string | null;
  sustainabilityNotes: string;
  explanation: string[];
}

@Injectable()
export class OptimizationService {
  constructor(
    private readonly scoringService: ScoringService,
    private readonly shelfLifeService: ShelfLifeService,
    private readonly costService: CostService,
    private readonly sustainabilityService: SustainabilityService,
    private readonly explanationService: ExplanationService,
  ) {}

  optimize(params: {
    candidates: StructureCandidate[];
    requirement: DerivedRequirement;
    objective: ObjectiveType;
    transportType: TransportType;
    storageType: StorageType;
    targetShelfLifeDays: number;
    shelfLifeData: FoodShelfLifeData[];
  }): RankedRecommendation[] {
    const { candidates, requirement, objective, transportType, storageType, targetShelfLifeDays, shelfLifeData } =
      params;

    const intermediate = candidates.map((structure) => {
      const raw = this.scoringService.extractRawMetrics(structure);
      const score = this.scoringService.score(raw, requirement, transportType, structure.supportsMap);
      const barrierFitAverage = (score.barrierSuitability + score.moistureProtection) / 2;
      const shelfLife = this.shelfLifeService.estimate(shelfLifeData, storageType, barrierFitAverage);
      const cost = this.costService.estimate(structure);
      const sustainability = this.sustainabilityService.evaluate(raw);
      const explanation = this.explanationService.explain(structure, score, requirement, storageType);

      const shelfLifeMidpoint =
        shelfLife.minDays !== null && shelfLife.maxDays !== null
          ? (shelfLife.minDays + shelfLife.maxDays) / 2
          : null;
      const shelfLifePotential =
        shelfLifeMidpoint !== null
          ? clamp(Math.round((shelfLifeMidpoint / targetShelfLifeDays) * 100), 0, 100)
          : 50;

      const costMidpoint = cost.min !== null && cost.max !== null ? (cost.min + cost.max) / 2 : null;

      const barrierLayer =
        structure.layers.find((l) => l.layerRole === LayerRole.BARRIER) ?? structure.layers[0];

      return {
        structure,
        raw,
        score,
        shelfLife,
        shelfLifePotential,
        cost,
        costMidpoint,
        sustainability,
        explanation,
        primaryMaterialId: barrierLayer?.materialId ?? null,
      };
    });

    const validCostMidpoints = intermediate
      .map((c) => c.costMidpoint)
      .filter((v): v is number => v !== null);
    const minCost = validCostMidpoints.length ? Math.min(...validCostMidpoints) : null;
    const maxCost = validCostMidpoints.length ? Math.max(...validCostMidpoints) : null;

    const weights = OBJECTIVE_WEIGHTS[objective];

    const ranked = intermediate.map((c) => {
      const costScore =
        c.costMidpoint === null || minCost === null || maxCost === null
          ? 50
          : maxCost === minCost
            ? 100
            : Math.round(100 - ((c.costMidpoint - minCost) / (maxCost - minCost)) * 100);

      const sustainabilityScore = c.sustainability.score ?? 50;

      const dims: ScoreDimensions = {
        barrierSuitability: c.score.barrierSuitability,
        moistureProtection: c.score.moistureProtection,
        mechanicalSuitability: c.score.mechanicalSuitability,
        sealability: c.score.sealability,
        shelfLifePotential: c.shelfLifePotential,
        cost: costScore,
        sustainability: sustainabilityScore,
        mapSuitability: c.score.mapSuitability,
      };

      const dimensionKeys = Object.keys(dims) as DimensionKey[];
      const weightSum = dimensionKeys.reduce((sum, key) => sum + weights[key], 0);
      const overallScore =
        Math.round(
          (dimensionKeys.reduce((sum, key) => sum + dims[key] * weights[key], 0) / weightSum) *
            10,
        ) / 10;

      return {
        structureId: c.structure.id,
        supportsMap: c.structure.supportsMap,
        primaryMaterialId: c.primaryMaterialId,
        overallScore,
        scoreBreakdown: dims,
        estimatedShelfLifeMinDays: c.shelfLife.minDays,
        estimatedShelfLifeMaxDays: c.shelfLife.maxDays,
        shelfLifeConfidence: c.shelfLife.confidence,
        estimatedCostMin: c.cost.min,
        estimatedCostMax: c.cost.max,
        costUnit: c.cost.unit,
        sustainabilityNotes: c.sustainability.notes,
        explanation: c.explanation,
      };
    });

    ranked.sort((a, b) => b.overallScore - a.overallScore);

    // A sealed, non-MAP pack risks real anaerobic spoilage on a commodity
    // whose respiration calls for MAP — that's a hard failure mode, not
    // just one more scored dimension outweighed by e.g. cost. When MAP is
    // recommended, the lead pick must be MAP-capable, and among those the
    // one that actually fits the required gas-exchange rate (highest
    // barrierSuitability — e.g. a micro-perforated lid over a sealed
    // barrier laminate for a fast-respiring commodity), not just whichever
    // MAP-capable structure happens to score highest overall on unrelated
    // dimensions like cost or sealability.
    if (requirement.mapRecommended) {
      const mapCapable = ranked.filter((r) => r.supportsMap);
      if (mapCapable.length) {
        const best = mapCapable.reduce((a, b) =>
          b.scoreBreakdown.barrierSuitability !== a.scoreBreakdown.barrierSuitability
            ? b.scoreBreakdown.barrierSuitability > a.scoreBreakdown.barrierSuitability
              ? b
              : a
            : b.overallScore > a.overallScore
              ? b
              : a,
        );
        const bestIndex = ranked.indexOf(best);
        if (bestIndex > 0) {
          ranked.splice(bestIndex, 1);
          ranked.unshift(best);
        }
      }
    } else if (requirement.targetOtrMax !== null && requirement.targetOtrMax <= 100) {
      // For oxidation-sensitive goods (target OTR <= 100), oxygen barrier is critical
      // to prevent rancidity. Ensure the lead recommendation meets barrier suitability.
      const barrierCapable = ranked.filter((r) => r.scoreBreakdown.barrierSuitability >= 50);
      if (barrierCapable.length > 0 && ranked[0].scoreBreakdown.barrierSuitability < 50) {
        const bestBarrier = barrierCapable[0];
        const idx = ranked.indexOf(bestBarrier);
        if (idx > 0) {
          ranked.splice(idx, 1);
          ranked.unshift(bestBarrier);
        }
      }
    }

    return ranked.map(({ supportsMap: _supportsMap, ...r }, index) => ({
      ...r,
      rank: index,
      isRecommended: index === 0,
    }));
  }
}
