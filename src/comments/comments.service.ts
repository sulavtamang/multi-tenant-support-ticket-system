import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { RequestContext } from 'src/shared/request-context/dto/request-context.dto';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async create(
    ticketId: string,
    dto: CreateCommentDto,
    ctx: RequestContext
  ) {
    // confirm the ticket actually belongs to this org before attaching a comment to it
    const ticket = await this.prisma.ticket.findFirst({
      where: { id: ticketId, organizationId: ctx.organizationId },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');

    return this.prisma.comment.create({
      data: {
        body: dto.body,
        ticketId,
        agentId:ctx.user!.agentId
      }
    });
  }

  async findAllForTicket(ticketId: string, ctx: RequestContext) {
    const ticket = await this.prisma.ticket.findFirst({
      where: { id: ticketId, organizationId: ctx.organizationId },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');

    return this.prisma.comment.findMany({
      where: { ticketId },
      select: {
        id: true,
        body: true,
        createdAt: true,
        agent: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
