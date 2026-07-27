import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAgentDto } from './dto/create-agent.dto';
import { RequestContext } from 'src/shared/request-context/dto/request-context.dto';
import { FindAgentsQueryDto } from './dto/find-agents-query.dto';
import { MetadataScanner } from '@nestjs/core';
@Injectable()
export class AgentsService {
  constructor(private prisma: PrismaService) {}

  async create(ctx: RequestContext, dto: CreateAgentDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    return this.prisma.agent.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        organizationId: ctx.organizationId,
        role: 'MEMBER',
      },
      select: { id: true, name: true, email: true, role: true }, // shape the response directly
    });
  }

  async findAll(ctx: RequestContext, query: FindAgentsQueryDto) {
    const { page, limit, role } = query;
    const skip = (page - 1) * limit;

    const where = {
      organizationId: ctx.organizationId,
      ...(role && { role }),
    };
    const [agents, total] = await this.prisma.$transaction([
      this.prisma.agent.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'desc' },
        select: { id: true, name: true, email: true, role: true }, // password never fetched at all
      }),

      this.prisma.agent.count({ where }),
    ]);
    return {
      data: agents,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
