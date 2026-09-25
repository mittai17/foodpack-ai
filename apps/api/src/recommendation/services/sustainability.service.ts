import { Injectable } from '@nestjs/common';
import type { RawCandidateMetrics } from './scoring.service';

export interface SustainabilityResult {
  score: number | null;
  notes: string;
}

@Injectable()
export class SustainabilityService {
  /**
   * Scores sustainability from structural facts we actually know
   * (recyclability flags, mono-material construction, biodegradability) —
   * never invents a carbon-footprint number.
   */
  evaluate(raw: RawCandidateMetrics): SustainabilityResult {
    if (raw.allLayersRecyclable === null && !raw.anyLayerBiodegradable) {
      return {
        score: null,
        notes: 'Insufficient validated environmental data for this packaging option.',
      };
    }

    let score = 50;
    const notes: string[] = [];

    if (raw.allLayersRecyclable === true) {
      score += 25;
      notes.push('All layers are recyclable.');
    } else if (raw.allLayersRecyclable === false) {
      score -= 15;
      notes.push('At least one layer is not readily recyclable.');
    }

    if (raw.distinctMaterialCount === 1) {
      score += 15;
      notes.push('Mono-material construction simplifies recycling.');
    } else if (raw.distinctMaterialCount >= 3) {
      score -= 10;
      notes.push('Multi-material laminate is harder to recycle at end of life.');
    }

    if (raw.anyLayerBiodegradable) {
      score += 10;
      notes.push('Includes a biodegradable layer.');
    }

    return {
      score: Math.max(0, Math.min(100, Math.round(score))),
      notes: notes.join(' '),
    };
  }
}
