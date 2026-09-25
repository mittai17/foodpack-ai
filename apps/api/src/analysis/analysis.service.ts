import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RecommendationService } from '../recommendation/recommendation.service';
import { CreateAnalysisDto } from './dto/create-analysis.dto';
import { UpdateAnalysisDto } from './dto/update-analysis.dto';

const analysisInclude = {
  food: { include: { category: true, sources: true, storageConditions: true } },
  requirement: true,
  recommendations: {
    orderBy: { rank: 'asc' as const },
    include: {
      structure: {
        include: {
          layers: {
            orderBy: { order: 'asc' as const },
            include: {
              material: {
                include: {
                  sources: true,
                  properties: { include: { source: true } },
                },
              },
            },
          },
        },
      },
    },
  },
};

@Injectable()
export class AnalysisService {
  private readonly logger = new Logger(AnalysisService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly recommendationService: RecommendationService,
  ) {}

  async create(userId: string, dto: CreateAnalysisDto) {
    const analysis = await this.prisma.analysis.create({
      data: {
        userId,
        projectId: dto.projectId,
        foodId: dto.foodId,
        status: 'PROCESSING',
        productState: dto.productState,
        storageType: dto.storageType,
        transportType: dto.transportType,
        targetShelfLifeDays: dto.targetShelfLifeDays,
        packageWeightKg: dto.packageWeightKg,
        objective: dto.objective,
        advancedInputs: dto.advancedMode
          ? ((dto.advancedInputs ?? {}) as unknown as Prisma.InputJsonValue)
          : undefined,
      },
    });

    try {
      // Synchronous today (the rule engine runs in low-single-digit
      // milliseconds); the pipeline is isolated in RecommendationService
      // so it can be moved behind a BullMQ worker without touching this
      // controller/service boundary once analyses get heavier (RAG, ML).
      await this.recommendationService.run(analysis);
      await this.prisma.analysis.update({
        where: { id: analysis.id },
        data: { status: 'COMPLETED' },
      });
    } catch (error) {
      this.logger.error(`Analysis ${analysis.id} failed: ${(error as Error).message}`);
      await this.prisma.analysis.update({
        where: { id: analysis.id },
        data: { status: 'FAILED', errorMessage: (error as Error).message },
      });
    }

    return this.findOne(userId, analysis.id);
  }

  async findOne(userId: string, id: string) {
    const analysis = await this.prisma.analysis.findFirst({
      where: { id, userId },
      include: analysisInclude,
    });
    if (!analysis) {
      throw new NotFoundException({
        code: 'ANALYSIS_NOT_FOUND',
        message: `No analysis found for id "${id}".`,
      });
    }
    return analysis;
  }

  async update(userId: string, id: string, dto: UpdateAnalysisDto) {
    await this.findOne(userId, id);

    if (dto.projectId) {
      const project = await this.prisma.project.findFirst({
        where: { id: dto.projectId, userId },
      });
      if (!project) {
        throw new ForbiddenException({
          code: 'PROJECT_NOT_FOUND',
          message: 'That project does not exist or does not belong to you.',
        });
      }
    }

    await this.prisma.analysis.update({
      where: { id },
      data: { projectId: dto.projectId },
    });

    return this.findOne(userId, id);
  }

  async listForUser(userId: string, page: number, pageSize: number) {
    const [items, total] = await Promise.all([
      this.prisma.analysis.findMany({
        where: { userId },
        include: analysisInclude,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.analysis.count({ where: { userId } }),
    ]);
    return {
      items,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) || 1 },
    };
  }
}
