import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReqContext } from 'src/shared/request-context/request-context.decorator';
import { RequestContext } from 'src/shared/request-context/dto/request-context.dto';
import { FindCommentsQueryDto } from './dto/find-comments-query.dto';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@ApiTags('comments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tickets/:ticketId/comments')
export class CommentsController {
  constructor(
    private commentsService: CommentsService,
    @InjectPinoLogger(CommentsController.name)
    private readonly logger: PinoLogger,
  ) {}

  @Post()
  create(
    @Param('ticketId', ParseUUIDPipe) ticketId: string,
    @Body() dto: CreateCommentDto,
    @ReqContext() ctx: RequestContext,
  ) {
    this.logger.info(
      {
        ticketId,
        organizationId: ctx.organizationId,
        agentId: ctx.user?.agentId,
      },
      'Create comment request',
    );
    return this.commentsService.create(ticketId, dto, ctx);
  }

  @Get()
  findAll(
    @Param('ticketId', ParseUUIDPipe) ticketId: string,
    @Query() query: FindCommentsQueryDto,
    @ReqContext() ctx: RequestContext,
  ) {
    this.logger.debug(
      { ticketId, organizationId: ctx.organizationId },
      'List comments request',
    );
    return this.commentsService.findAllForTicket(ticketId, ctx, query);
  }
}
