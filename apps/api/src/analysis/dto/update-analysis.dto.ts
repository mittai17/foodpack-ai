import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateAnalysisDto {
  @ApiPropertyOptional({ description: 'Project to attach this analysis to, or null to detach.' })
  @IsOptional()
  @IsString()
  projectId?: string | null;
}
