import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { RecommendationService } from './recommendation.service';
import { RequirementEngineService } from './services/requirement-engine.service';
import { CandidateGeneratorService } from './services/candidate-generator.service';
import { ScoringService } from './services/scoring.service';
import { OptimizationService } from './services/optimization.service';
import { ExplanationService } from './services/explanation.service';
import { ShelfLifeService } from './services/shelf-life.service';
import { CostService } from './services/cost.service';
import { SustainabilityService } from './services/sustainability.service';

@Module({
  imports: [AiModule],
  providers: [
    RecommendationService,
    RequirementEngineService,
    CandidateGeneratorService,
    ScoringService,
    OptimizationService,
    ExplanationService,
    ShelfLifeService,
    CostService,
    SustainabilityService,
  ],
  exports: [RecommendationService],
})
export class RecommendationModule {}
