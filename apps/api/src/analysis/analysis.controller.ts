import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LOCAL_USER_ID } from '../common/constants/local-user.constant';
import { AnalysisService } from './analysis.service';
import { CreateAnalysisDto } from './dto/create-analysis.dto';
import { ListAnalysisQuery } from './dto/list-analysis.query';
import { UpdateAnalysisDto } from './dto/update-analysis.dto';

@ApiTags('analysis')
@Controller({ path: 'analysis', version: '1' })
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Post()
  create(@Body() dto: CreateAnalysisDto) {
    return this.analysisService.create(LOCAL_USER_ID, dto);
  }

  @Get()
  list(@Query() query: ListAnalysisQuery) {
    return this.analysisService.listForUser(LOCAL_USER_ID, query.page, query.pageSize);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.analysisService.findOne(LOCAL_USER_ID, id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAnalysisDto) {
    return this.analysisService.update(LOCAL_USER_ID, id, dto);
  }
}
