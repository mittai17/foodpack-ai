import { Injectable } from '@nestjs/common';
import type { StructureCandidate } from './candidate-generator.service';

export interface CostEstimate {
  min: number | null;
  max: number | null;
  unit: string | null;
  note: string;
}

@Injectable()
export class CostService {
  /**
   * Prefers a structure-level indicative cost (seeded per finished pack).
   * Falls back to summing per-layer material cost ranges. Always labeled
   * "Estimated" — never presented as verified supplier pricing.
   */
  estimate(structure: StructureCandidate): CostEstimate {
    if (structure.approxCostMin !== null && structure.approxCostMax !== null) {
      return {
        min: structure.approxCostMin,
        max: structure.approxCostMax,
        unit: structure.costUnit ?? '₹/pack',
        note: 'Estimated indicative cost per pack. Not verified supplier pricing.',
      };
    }

    const mins = structure.layers
      .map((l) => l.material.approxCostMin)
      .filter((v): v is number => v !== null);
    const maxs = structure.layers
      .map((l) => l.material.approxCostMax)
      .filter((v): v is number => v !== null);

    if (mins.length === 0 || maxs.length === 0) {
      return {
        min: null,
        max: null,
        unit: null,
        note: 'Insufficient validated cost data for this packaging option.',
      };
    }

    return {
      min: Math.round(mins.reduce((a, b) => a + b, 0) * 100) / 100,
      max: Math.round(maxs.reduce((a, b) => a + b, 0) * 100) / 100,
      unit: structure.layers[0]?.material.costUnit ?? '₹/pack',
      note: 'Estimated indicative cost per pack, summed from constituent material costs. Not verified supplier pricing.',
    };
  }
}
