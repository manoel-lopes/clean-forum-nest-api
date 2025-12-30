import {
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  NotFoundException,
  Param,
  Put,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { UpdateCommentUseCase } from '@/domain/application/usecases/update-comment/update-comment.usecase'
import { CurrentUser } from '@/infra/auth/decorators/current-user.decorator'
import type { AuthUser } from '@/infra/auth/strategies/jwt.strategy'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe'
import {
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@/infra/http/presentation/decorators/api-responses.decorator'
import {
  UpdateCommentBodyDto,
  updateCommentBodySchema,
} from '@/infra/http/ports/comments/update-comment.schema'
import { NotAuthorException } from '@/shared/application/exceptions/not-author.exception'
import { ResourceNotFoundException } from '@/shared/application/exceptions/resource-not-found.exception'

@ApiTags('Comments')
@Controller('comments')
export class UpdateCommentController {
  constructor (private readonly updateCommentUseCase: UpdateCommentUseCase) {}

  @Put(':commentId')
  @HttpCode(200)
  @ApiOperation({ summary: 'Update a comment' })
  @ApiOkResponse('Comment updated successfully')
  @ApiUnauthorizedResponse()
  @ApiNotFoundResponse('Comment not found')
  @ApiInternalServerErrorResponse()
  async handle (
    @CurrentUser() user: AuthUser,
    @Param('commentId') commentId: string,
    @Body(new ZodValidationPipe(updateCommentBodySchema)) body: UpdateCommentBodyDto
  ) {
    try {
      const { content } = body
      const response = await this.updateCommentUseCase.execute({
        commentId,
        authorId: user.id,
        content,
      })
      return response
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        throw new NotFoundException(error.message)
      }
      if (error instanceof NotAuthorException) {
        throw new ForbiddenException(error.message)
      }
      throw error
    }
  }
}
