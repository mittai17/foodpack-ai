import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ListMaterialsQuery } from './dto/list-materials.query';

@Injectable()
export class MaterialsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListMaterialsQuery) {
    const where = {
      AND: [
        query.materialType ? { materialType: query.materialType } : {},
        query.search
          ? { name: { contains: query.search, mode: 'insensitive' as const } }
          : {},
      ],
    };

    const [items, total] = await Promise.all([
      this.prisma.packagingMaterial.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.packagingMaterial.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize) || 1,
      },
    };
  }

  async findBySlugOrId(idOrSlug: string) {
    const material = await this.prisma.packagingMaterial.findFirst({
      where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
      include: {
        properties: { include: { source: true } },
        sources: true,
      },
    });
    if (!material) {
      throw new NotFoundException({
        code: 'MATERIAL_NOT_FOUND',
        message: `No packaging material found for "${idOrSlug}".`,
      });
    }
    return material;
  }
}
