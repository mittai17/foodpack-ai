import { Injectable } from '@nestjs/common';
import type { FoodShelfLifeData, ConfidenceLevel } from '@prisma/client';
import type { StorageType } from '@foodpack/shared';
import { clamp } from './scoring-math';

export interface ShelfLifeEstimate {
  minDays: number | null;
  maxDays: number | null;
  confidence: ConfidenceLevel;
  note: string;
}

@Injectable()
export class ShelfLifeService {
  /**
   * Combines the food's own KB shelf-life range for the selected storage
   * type with how well the candidate's barrier properties fit the derived
   * requirement. Never invents a range for a food with no KB shelf-life
   * data — returns nulls + a clear note instead.
   */
  estimate(
    shelfLifeData: FoodShelfLifeData[],
    storageType: StorageType,
    barrierFitAverage: number,
  ): ShelfLifeEstimate {
    const entry = shelfLifeData.find((d) => d.storageType === storageType);
    if (!entry || entry.minDays === null || entry.maxDays === null) {
      return {
        minDays: null,
        maxDays: null,
        confidence: 'LOW',
        note: 'Insufficient validated shelf-life data for this commodity under the selected storage condition.',
      };
    }

    const qualityFactor = clamp(barrierFitAverage / 100, 0.5, 1.0);
    const minDays = Math.round(entry.minDays * qualityFactor);
    const maxDays = Math.round(entry.maxDays * qualityFactor);
    const confidence: ConfidenceLevel =
      qualityFactor < 0.65 && entry.confidence !== 'LOW' ? 'LOW' : entry.confidence;

    return {
      minDays,
      maxDays,
      confidence,
      note:
        'Decision-support estimate combining the knowledge-base shelf-life range with how well this packaging matches the derived barrier requirement. Validate experimentally before commercial production.',
    };
  }
}
