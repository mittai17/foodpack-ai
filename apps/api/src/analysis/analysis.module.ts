import { Module } from '@nestjs/common';
import { RecommendationModule } from '../recommendation/recommendation.module';
import { AnalysisController } from './analysis.controller';
import { AnalysisService } from './analysis.service';

@Module({
  imports: [RecommendationModule],
  controllers: [AnalysisController],
  providers: [AnalysisService],
})
export class AnalysisModule {}
