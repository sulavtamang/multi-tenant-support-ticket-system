import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Page Number', default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number) // converts the incoming string query param into a real number
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Items Per Page',
    default: 3,
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5) // hard ceiling — a client can't request 100,000 rows in one page
  limit: number = 20;
}
