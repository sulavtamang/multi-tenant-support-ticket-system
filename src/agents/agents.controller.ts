import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AgentsService } from './agents.service';
import { CreateAgentDto } from './dto/create-agent.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequestContext } from 'src/shared/request-context/dto/request-context.dto';
import { ReqContext } from 'src/shared/request-context/request-context.decorator';
import { FindAgentsQueryDto } from './dto/find-agents-query.dto';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@ApiTags('agents')
@ApiBearerAuth()
@Controller('agents')
export class AgentsController {
  constructor(
    private agentsService: AgentsService,
    @InjectPinoLogger(AgentsController.name)
    private readonly logger: PinoLogger,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER')
  @Post()
  create(@ReqContext() ctx: RequestContext, @Body() dto: CreateAgentDto) {
    this.logger.info(
      { organizationId: ctx.organizationId, email: dto.email },
      'Create agent request',
    );
    return this.agentsService.create(ctx, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() query: FindAgentsQueryDto, @ReqContext() ctx: RequestContext) {
    this.logger.debug(
      { organizationId: ctx.organizationId },
      'List agents request',
    );
    return this.agentsService.findAll(ctx, query);
  }
}
