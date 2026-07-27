import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import { RequestContext } from 'src/shared/request-context/dto/request-context.dto';
import { FindTicketsQueryDto } from './dto/find-tickets-query.dto';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Injectable()
export class TicketsService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectPinoLogger(TicketsService.name) private readonly logger: PinoLogger,
  ) {}

  async create(dto: CreateTicketDto, ctx: RequestContext) {
    this.logger.info({ organizationId: ctx.organizationId }, 'Creating new ticket');
    const ticket = await this.prisma.ticket.create({
      data: {
        title: dto.title,
        description: dto.description,
        organizationId: ctx.organizationId,
      },
    });
    this.logger.info({ ticketId: ticket.id }, 'Ticket created');
    return ticket;
  }

  async findAll(ctx: RequestContext, query: FindTicketsQueryDto) {
    this.logger.debug(
      { organizationId: ctx.organizationId },
      'Fetching tickets for organization',
    );
    const { page, limit, status, assignedAgent } = query;
    const skip = (page - 1) * limit;

    const where = {
      organizationId: ctx.organizationId,
      ...(status && { status }),
      ...(assignedAgent && { assignedAgent }),
    };

    const [tickets, total] = await this.prisma.$transaction([
      this.prisma.ticket.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
          agent: { select: { id: true, name: true, email: true } }, // never leak password,
        },
      }),
      this.prisma.ticket.count({ where }),
    ]);
    return {
      data: tickets,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // tenant-safe findOne: scoped by BOTH id and organizationId,
  // so a ticket from another org simply doesn't exist from this org's perspective
  async findOne(id: string, ctx: RequestContext) {
    const ticket = await this.prisma.ticket.findFirst({
      where: { id, organizationId: ctx.organizationId },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        createdAt: true,
        agent: {
          select: { id: true, name: true, email: true },
        },
        comments: {
          select: {
            id: true,
            body: true,
            createdAt: true,
            agent: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }

  async updateStatus(
    id: string,
    dto: UpdateTicketStatusDto,
    ctx: RequestContext,
  ) {
    await this.findOne(id, ctx); // throws 404 if not in this org
    return this.prisma.ticket.update({
      where: { id },
      data: { status: dto.status },
    });
  }

  async assignAgent(id: string, agentId: string, ctx: RequestContext) {
    await this.findOne(id, ctx);
    return this.prisma.ticket.update({
      where: { id },
      data: { assignedAgent: agentId },
    });
  }
}
