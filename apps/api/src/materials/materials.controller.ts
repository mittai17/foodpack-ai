import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MaterialsService } from './materials.service';
import { ListMaterialsQuery } from './dto/list-materials.query';

@ApiTags('materials')
@Controller({ path: 'materials', version: '1' })
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Get()
  list(@Query() query: ListMaterialsQuery) {
    return this.materialsService.list(query);
  }

  @Get(':idOrSlug')
  detail(@Param('idOrSlug') idOrSlug: string) {
    return this.materialsService.findBySlugOrId(idOrSlug);
  }
}
