import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { ConfigService } from '@nestjs/config';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(
    private configService: ConfigService,
    @InjectPinoLogger(PrismaService.name) private readonly logger: PinoLogger,
  ) {
    const adapter = new PrismaPg({
      connectionString: configService.get<string>('DATABASE_URL') as string,
    });
    super({ adapter });
  }
  async onModuleInit() {
    this.logger.info('Connecting to database');
    await this.$connect();
    this.logger.info('Database connected');
  }

  async onModuleDestroy() {
    this.logger.info('Disconnecting from database');
    await this.$disconnect();
    this.logger.info('Database disconnected');
  }
}
