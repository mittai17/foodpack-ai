import { Injectable } from '@nestjs/common';
import type { StorageType } from '@foodpack/shared';
import type { DerivedRequirement } from './requirement-engine.service';
import type { CandidateScore } from './scoring.service';
import type { StructureCandidate } from './candidate-generator.service';

@Injectable()
export class ExplanationService {
  /**
   * Deterministic, rule-based explanation bullets — no LLM involved.
   * Gemini (AiService) may later turn these into flowing prose, but the
   * underlying claims always come from here.
   */
  explain(
    structure: StructureCandidate,
    score: CandidateScore,
    requirement: DerivedRequirement,
    storageType: StorageType,
  ): string[] {
    const bullets: string[] = [];

    bullets.push(this.describeFit('Moisture protection', score.moistureProtection, score.raw.representativeWvtr, requirement.targetWvtrMin, requirement.targetWvtrMax, requirement.wvtrUnit));
    bullets.push(this.describeFit('Oxygen protection', score.barrierSuitability, score.raw.representativeOtr, requirement.targetOtrMin, requirement.targetOtrMax, requirement.otrUnit));

    if (requirement.mapRecommended) {
      bullets.push(
        structure.supportsMap
          ? 'Supports Modified Atmosphere Packaging / micro-perforation, matching the gas-exchange needs of this fresh commodity.'
          : 'This commodity benefits from MAP or micro-perforation, which this structure does not provide — consider an alternative with breathable film.',
      );
    }

    bullets.push(
      score.mechanicalSuitability >= 75
        ? 'Mechanical strength comfortably covers the expected handling and transport stresses.'
        : score.mechanicalSuitability >= 50
          ? 'Mechanical strength is adequate but leaves limited margin for rough handling.'
          : 'Mechanical strength may be marginal for the selected transport conditions — consider added padding or a sturdier structure.',
    );

    bullets.push(
      storageType === 'FROZEN'
        ? 'Storage compatibility: verify low-temperature flexibility for frozen handling.'
        : storageType === 'CHILLED'
          ? 'Storage compatibility: suitable for refrigerated distribution.'
          : 'Storage compatibility: suitable for ambient shelf storage.',
    );

    return bullets;
  }

  private describeFit(
    label: string,
    fitScore: number,
    value: number | null,
    min: number | null,
    max: number | null,
    unit: string | null,
  ): string {
    if (value === null || min === null || max === null) {
      return `${label}: insufficient validated data to compare against the target range.`;
    }
    if (fitScore >= 90) {
      return `${label}: strong match — measured ${value} ${unit} sits within the target range (${min}–${max} ${unit}).`;
    }
    if (fitScore >= 60) {
      return `${label}: reasonable match — measured ${value} ${unit} is close to the target range (${min}–${max} ${unit}).`;
    }
    return `${label}: weak match — measured ${value} ${unit} is well outside the target range (${min}–${max} ${unit}).`;
  }
}
