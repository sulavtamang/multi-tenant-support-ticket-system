import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAgentDto } from './dto/create-agent.dto';

@Injectable()
export class AgentsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAgentDto, organizationId: string) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    return this.prisma.agent.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        organizationId,
        role: 'MEMBER',
      },
      select: { id: true, name: true, email: true, role: true }, // shape the response directly
    });
  }

  async findAll(organizationId: string) {
    return this.prisma.agent.findMany({
      where: { organizationId },
      select: { id: true, name: true, email: true, role: true }, // password never fetched at all
    });
  }
}
