import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTicketDto, organizationId: string) {
    return this.prisma.ticket.create({
      data: { title: dto.title, description: dto.description, organizationId },
    });
  }

  async findAll(organizationId: string) {
    return this.prisma.ticket.findMany({
      where: { organizationId },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        agent: {
          select: { id: true, name: true, email: true }, // never leak password
        },
      },
    });
  }

  // tenant-safe findOne: scoped by BOTH id and organizationId,
  // so a ticket from another org simply doesn't exist from this org's perspective
  async findOne(id: string, organizationId: string) {
    const ticket = await this.prisma.ticket.findFirst({
      where: { id, organizationId },
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
    organizationId: string,
  ) {
    await this.findOne(id, organizationId); // throws 404 if not in this org
    return this.prisma.ticket.update({
      where: { id },
      data: { status: dto.status },
    });
  }

  async assignAgent(id: string, agentId: string, organizationId: string) {
    await this.findOne(id, organizationId);
    return this.prisma.ticket.update({
      where: { id },
      data: { assignedAgent: agentId },
    });
  }
}
