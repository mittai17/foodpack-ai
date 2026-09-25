import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InsufficientDataException } from '../common/exceptions/insufficient-data.exception';
import { RequirementEngineService } from './services/requirement-engine.service';
import { CandidateGeneratorService } from './services/candidate-generator.service';
import { OptimizationService } from './services/optimization.service';
import { AiService } from '../ai/ai.service';
import { deriveProductForm } from './config/product-form';
import type { Analysis, Prisma } from '@prisma/client';

@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly requirementEngine: RequirementEngineService,
    private readonly candidateGenerator: CandidateGeneratorService,
    private readonly optimizationService: OptimizationService,
    private readonly aiService: AiService,
  ) {}

  /**
   * Runs the full deterministic pipeline for an already-created Analysis
   * row: Food Resolver -> Requirement Engine -> Candidate Generator ->
   * Scoring -> Optimization -> persisted Requirement + Recommendation rows.
   * Gemini only touches the final, already-computed top recommendation to
   * add a natural-language explanation — it never decides the ranking.
   */
  async run(analysis: Analysis): Promise<void> {
    const food = await this.prisma.food.findUnique({
      where: { id: analysis.foodId },
      include: { properties: true, shelfLifeData: true, respirationData: true, category: true },
    });
    if (!food) {
      throw new InsufficientDataException(
        `Food ${analysis.foodId} could not be resolved.`,
      );
    }

    const requirement = this.requirementEngine.derive({
      food,
      productState: analysis.productState as any,
      storageType: analysis.storageType as any,
      transportType: analysis.transportType as any,
      targetShelfLifeDays: analysis.targetShelfLifeDays,
      advancedInputs: (analysis.advancedInputs as any) ?? undefined,
    });

    const candidates = await this.candidateGenerator.generate(
      analysis.packageWeightKg,
      deriveProductForm(food),
    );
    if (candidates.length === 0) {
      throw new InsufficientDataException(
        'No packaging structures with validated barrier data are available yet to score candidates against.',
      );
    }

    const ranked = this.optimizationService.optimize({
      candidates,
      requirement,
      objective: analysis.objective as any,
      transportType: analysis.transportType as any,
      storageType: analysis.storageType as any,
      targetShelfLifeDays: analysis.targetShelfLifeDays,
      shelfLifeData: food.shelfLifeData,
    });

    await this.prisma.requirement.create({
      data: {
        analysisId: analysis.id,
        targetOtrMin: requirement.targetOtrMin,
        targetOtrMax: requirement.targetOtrMax,
        otrUnit: requirement.otrUnit,
        targetWvtrMin: requirement.targetWvtrMin,
        targetWvtrMax: requirement.targetWvtrMax,
        wvtrUnit: requirement.wvtrUnit,
        mapRecommended: requirement.mapRecommended,
        recommendedO2Min: requirement.recommendedO2Min,
        recommendedO2Max: requirement.recommendedO2Max,
        recommendedCo2Min: requirement.recommendedCo2Min,
        recommendedCo2Max: requirement.recommendedCo2Max,
        sealabilityRequired: requirement.sealabilityRequired,
        mechanicalNotes: requirement.mechanicalNotes,
        assumptions: requirement.assumptions,
        limitingFactors: requirement.limitingFactors,
        dataConfidence: requirement.dataConfidence,
      },
    });

    const top = ranked[0];
    const topStructure = candidates.find((c) => c.id === top.structureId);
    let aiExplanation: string | null = null;

    if (topStructure && this.aiService.isAvailable) {
      try {
        aiExplanation = await this.aiService.explainRecommendation({
          foodName: food.name,
          structureName: topStructure.name,
          materials: topStructure.layers.map((l) => l.material.name),
          otrUnit: requirement.otrUnit,
          wvtrUnit: requirement.wvtrUnit,
          targetOtrMin: requirement.targetOtrMin,
          targetOtrMax: requirement.targetOtrMax,
          targetWvtrMin: requirement.targetWvtrMin,
          targetWvtrMax: requirement.targetWvtrMax,
          estimatedShelfLifeMinDays: top.estimatedShelfLifeMinDays,
          estimatedShelfLifeMaxDays: top.estimatedShelfLifeMaxDays,
          estimatedCostMin: top.estimatedCostMin,
          estimatedCostMax: top.estimatedCostMax,
          costUnit: top.costUnit,
          ruleBasedBullets: top.explanation,
        });
      } catch (error) {
        this.logger.warn(`AI explanation skipped: ${(error as Error).message}`);
      }
    }

    await this.prisma.$transaction(
      ranked.map((r) =>
        this.prisma.recommendation.create({
          data: {
            analysisId: analysis.id,
            structureId: r.structureId,
            materialId: r.primaryMaterialId,
            rank: r.rank,
            isRecommended: r.isRecommended,
            overallScore: r.overallScore,
            scoreBreakdown: r.scoreBreakdown as unknown as Prisma.InputJsonValue,
            estimatedShelfLifeMinDays: r.estimatedShelfLifeMinDays,
            estimatedShelfLifeMaxDays: r.estimatedShelfLifeMaxDays,
            shelfLifeConfidence: r.shelfLifeConfidence,
            estimatedCostMin: r.estimatedCostMin,
            estimatedCostMax: r.estimatedCostMax,
            costUnit: r.costUnit,
            sustainabilityNotes: r.sustainabilityNotes,
            explanation: r.explanation,
            aiExplanation: r.isRecommended ? aiExplanation : null,
          },
        }),
      ),
    );
  }
}
