import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../shared/dto/pagination-query.dto';
import { TicketStatus } from 'generated/prisma/enums';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FindTicketsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: TicketStatus,
    description: 'Filter tickets by status.',
  })
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @ApiPropertyOptional({ description: 'Filter tickets by agent id' })
  @IsOptional()
  @IsUUID()
  assignedAgent?: string;
}
