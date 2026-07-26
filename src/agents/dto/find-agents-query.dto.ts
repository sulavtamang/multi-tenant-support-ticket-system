import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional} from "class-validator";
import { AgentRole } from "generated/prisma/enums";
import { PaginationQueryDto } from "src/shared/dto/pagination-query.dto";

export class FindAgentsQueryDto extends PaginationQueryDto {
    @ApiPropertyOptional({
        enum: AgentRole,
        description: 'Filter agents by role'
    })
    @IsOptional()
    @IsEnum(AgentRole)
    role!: AgentRole;
}