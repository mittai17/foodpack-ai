import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LOCAL_USER_ID } from '../common/constants/local-user.constant';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';

@ApiTags('projects')
@Controller({ path: 'projects', version: '1' })
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@Body() dto: CreateProjectDto) {
    return this.projectsService.create(LOCAL_USER_ID, dto);
  }

  @Get()
  list() {
    return this.projectsService.list(LOCAL_USER_ID);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(LOCAL_USER_ID, id);
  }
}
