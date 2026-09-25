import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FoodsService } from './foods.service';
import { ListFoodsQuery } from './dto/list-foods.query';

@ApiTags('foods')
@Controller({ path: 'foods', version: '1' })
export class FoodsController {
  constructor(private readonly foodsService: FoodsService) {}

  @Get()
  list(@Query() query: ListFoodsQuery) {
    return this.foodsService.list(query);
  }

  @Get('categories')
  categories() {
    return this.foodsService.categories();
  }

  @Get(':idOrSlug')
  detail(@Param('idOrSlug') idOrSlug: string) {
    return this.foodsService.findBySlugOrId(idOrSlug);
  }
}
