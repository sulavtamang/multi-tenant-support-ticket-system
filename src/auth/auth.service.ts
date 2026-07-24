import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterOrganizationDto } from './dto/register-organization.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login-dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // POST /auth/register-organization
  async registerOrganization(dto: RegisterOrganizationDto) {
    return this.prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: { name: dto.organizationName },
      });

      const hashedPassword = await bcrypt.hash(dto.password, 10);
      const agent = await tx.agent.create({
        data: {
          name: dto.name,
          email: dto.email,
          password: hashedPassword,
          organizationId: organization.id,
          role: 'OWNER', // first agent of a new org is always the owner
        },
      });

      return { organizationId: organization.id, agentId: agent.id };
    });
  }

  //POST /auth/login
  async login(dto: LoginDto) {
    const agent = await this.prisma.agent.findUnique({
      where: { email: dto.email },
    });
    if (!agent || !(await bcrypt.compare(dto.password, agent.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: agent.id,
      organizationId: agent.organizationId, // pulled from the DB row, not from the client
      role: agent.role,
    };
    return { access_token: await this.jwtService.signAsync(payload) };
  }
}

//sulav tamang auth key:
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YzI3MjM1Ny1mNDNiLTQ4ZWEtOTQyMi05MjY1MmMzZjI5MDUiLCJvcmdhbml6YXRpb25JZCI6IjUyOWQxMGIzLTI3NjQtNDYzMC05NWEzLWZlNTJlYjRkY2VjNiIsInJvbGUiOiJPV05FUiIsImlhdCI6MTc4NDYwMzIxMCwiZXhwIjoxNzg0NjA2ODEwfQ.vQS-2Avvz14UI8gMDo07WrwlVHM4nrv5QqhsEV5fU8E
