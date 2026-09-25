import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ListFoodsQuery } from './dto/list-foods.query';

@Injectable()
export class FoodsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListFoodsQuery) {
    const where = {
      AND: [
        query.category ? { category: { slug: query.category } } : {},
        query.search
          ? {
              OR: [
                { name: { contains: query.search, mode: 'insensitive' as const } },
                { commonNames: { has: query.search } },
              ],
            }
          : {},
      ],
    };

    const [items, total] = await Promise.all([
      this.prisma.food.findMany({
        where,
        include: { category: true },
        orderBy: { name: 'asc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.food.count({ where }),
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

  async categories() {
    return this.prisma.foodCategory.findMany({ orderBy: { name: 'asc' } });
  }

  async findBySlugOrId(idOrSlug: string) {
    const food = await this.prisma.food.findFirst({
      where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
      include: {
        category: true,
        properties: { include: { source: true } },
        storageConditions: { include: { source: true } },
        respirationData: { include: { source: true } },
        shelfLifeData: { include: { source: true } },
        sources: true,
      },
    });
    if (!food) {
      throw new NotFoundException({
        code: 'FOOD_NOT_FOUND',
        message: `No food commodity found for "${idOrSlug}".`,
      });
    }
    return food;
  }
}
