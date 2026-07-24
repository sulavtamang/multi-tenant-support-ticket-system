import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAgentDto } from './dto/create-agent.dto';
import { RequestContext } from 'src/shared/request-context/dto/request-context.dto';
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

  async findAll(ctx: RequestContext) {
    return this.prisma.agent.findMany({
      where: { organizationId: ctx.organizationId  },
      select: { id: true, name: true, email: true, role: true }, // password never fetched at all
    });
  }
}
