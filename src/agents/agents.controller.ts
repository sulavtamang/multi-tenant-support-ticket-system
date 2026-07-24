import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AgentsService } from './agents.service';
import { CreateAgentDto } from './dto/create-agent.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequestContext } from 'src/shared/request-context/dto/request-context.dto';
import { ReqContext } from 'src/shared/request-context/request-context.decorator';

@ApiTags('agents')
@ApiBearerAuth()
@Controller('agents')
export class AgentsController {
  constructor(private agentsService: AgentsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER')
  @Post()
  create(@ReqContext() ctx: RequestContext, @Body() dto: CreateAgentDto) {
    return this.agentsService.create(ctx, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@ReqContext() ctx: RequestContext) {
    return this.agentsService.findAll(ctx);
  }
}
