import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReqContext } from '../shared/request-context/request-context.decorator';
import { RequestContext } from 'src/shared/request-context/dto/request-context.dto';
import { FindTicketsQueryDto } from './dto/find-tickets-query.dto';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@ApiTags('tickets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tickets')
export class TicketsController {
  constructor(
    private ticketsService: TicketsService,
    @InjectPinoLogger(TicketsController.name)
    private readonly logger: PinoLogger,
  ) {}

  @Post()
  create(@Body() dto: CreateTicketDto, @ReqContext() ctx: RequestContext) {
    this.logger.info(
      { organizationId: ctx.organizationId, title: dto.title },
      'Create ticket request',
    );
    return this.ticketsService.create(dto, ctx);
  }

  @Get()
  findAll(@Query() query: FindTicketsQueryDto, @ReqContext() ctx: RequestContext) {
    this.logger.debug(
      { organizationId: ctx.organizationId },
      'List tickets request',
    );
    return this.ticketsService.findAll(ctx, query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @ReqContext() ctx: RequestContext) {
    this.logger.debug(
      { ticketId: id, organizationId: ctx.organizationId },
      'Get ticket request',
    );
    return this.ticketsService.findOne(id, ctx);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTicketStatusDto,
    @ReqContext() ctx: RequestContext,
  ) {
    this.logger.info(
      {
        ticketId: id,
        organizationId: ctx.organizationId,
        status: dto.status,
      },
      'Update ticket status request',
    );
    return this.ticketsService.updateStatus(id, dto, ctx);
  }

  @Patch(':id/assign/:agentId')
  assignAgent(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('agentId', ParseUUIDPipe) agentId: string,
    @ReqContext() ctx: RequestContext,
  ) {
    this.logger.info(
      { ticketId: id, organizationId: ctx.organizationId, agentId },
      'Assign agent request',
    );
    return this.ticketsService.assignAgent(id, agentId, ctx);
  }
}

// org1:
// ticket counts: 1
// id: c46268ff-2238-413d-82db-0096cec342fd
