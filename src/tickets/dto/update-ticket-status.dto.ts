import { IsEnum } from 'class-validator';
import { TicketStatus } from '../../../generated/prisma/client'; // adjust path to your generated client

export class UpdateTicketStatusDto {
  @IsEnum(TicketStatus)
  status!: TicketStatus;
}