import { Injectable } from '@nestjs/common';
import { GeminiService } from './gemini.service';

export interface RecommendationFacts {
  foodName: string;
  structureName: string;
  materials: string[];
  otrUnit: string | null;
  wvtrUnit: string | null;
  targetOtrMin: number | null;
  targetOtrMax: number | null;
  targetWvtrMin: number | null;
  targetWvtrMax: number | null;
  estimatedShelfLifeMinDays: number | null;
  estimatedShelfLifeMaxDays: number | null;
  estimatedCostMin: number | null;
  estimatedCostMax: number | null;
  costUnit: string | null;
  ruleBasedBullets: string[];
}

const SYSTEM_INSTRUCTION = `You are a food-packaging explanation assistant. You are given
a STRUCTURED, already-computed packaging recommendation (facts, not your own judgment).
Rewrite the given facts into 2-4 short, clear sentences for a non-technical user.
Rules: do not invent or change any number. Do not add technical claims not present in
the input. Do not recommend a different packaging than the one given. Keep it factual
and plain-English.`;

@Injectable()
export class AiService {
  constructor(private readonly gemini: GeminiService) {}

  get isAvailable(): boolean {
    return this.gemini.isConfigured;
  }

  async explainRecommendation(facts: RecommendationFacts): Promise<string | null> {
    const prompt = `Food: ${facts.foodName}
Recommended packaging: ${facts.structureName} (${facts.materials.join(' / ')})
Target OTR: ${facts.targetOtrMin ?? 'n/a'}-${facts.targetOtrMax ?? 'n/a'} ${facts.otrUnit ?? ''}
Target WVTR: ${facts.targetWvtrMin ?? 'n/a'}-${facts.targetWvtrMax ?? 'n/a'} ${facts.wvtrUnit ?? ''}
Estimated shelf life: ${facts.estimatedShelfLifeMinDays ?? 'n/a'}-${facts.estimatedShelfLifeMaxDays ?? 'n/a'} days
Estimated cost: ${facts.estimatedCostMin ?? 'n/a'}-${facts.estimatedCostMax ?? 'n/a'} ${facts.costUnit ?? ''}
Rule-based reasoning already computed:
${facts.ruleBasedBullets.map((b) => `- ${b}`).join('\n')}

Write the short plain-English explanation now.`;

    return this.gemini.generateText(SYSTEM_INSTRUCTION, prompt);
  }
}
