import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('tickets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tickets')
export class TicketsController {
  constructor(private ticketsService: TicketsService) {}

  @Post()
  create(@Body() dto: CreateTicketDto, @Req() req) {
    return this.ticketsService.create(dto, req.user.organizationId);
  }

  @Get()
  findAll(@Req() req) {
    return this.ticketsService.findAll(req.user.organizationId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    return this.ticketsService.findOne(id, req.user.organizationId);
  }

  @Patch(':id/status')
  updateStatus(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTicketStatusDto, @Req() req) {
    return this.ticketsService.updateStatus(id, dto, req.user.organizationId);
  }

  @Patch(':id/assign/:agentId')
  assignAgent(@Param('id', ParseUUIDPipe) id: string, @Param('agentId', ParseUUIDPipe) agentId: string, @Req() req) {
    return this.ticketsService.assignAgent(id, agentId, req.user.organizationId);
  }
}

// org1:
// ticket counts: 1
// id: c46268ff-2238-413d-82db-0096cec342fd