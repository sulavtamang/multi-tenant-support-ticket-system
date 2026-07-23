import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Req, UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('comments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tickets/:ticketId/comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Post()
  create(@Param('ticketId', ParseUUIDPipe) ticketId: string, @Body() dto: CreateCommentDto, @Req() req) {
    return this.commentsService.create(ticketId, dto, req.user.agentId, req.user.organizationId);
  }

  @Get()
  findAll(@Param('ticketId', ParseUUIDPipe) ticketId: string, @Req() req) {
    return this.commentsService.findAllForTicket(ticketId, req.user.organizationId);
  }
}