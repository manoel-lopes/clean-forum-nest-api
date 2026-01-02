import {
  Delete,
  ForbiddenException,
  HttpCode,
  NotFoundException,
  Param,
} from '@nestjs/common'
import { ApiOperation } from '@nestjs/swagger'
import { UseCase } from '@/core/domain/use-case'
import { CurrentUser } from '@/infra/auth/decorators/current-user.decorator'
import type { AuthUser } from '@/infra/auth/strategies/jwt.strategy'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe'
import {
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@/infra/http/presentation/decorators/api-responses.decorator'
import {
  DeleteCommentParamsDto,
  deleteCommentParamsSchema,
} from '@/infra/http/ports/comments/delete-comment.schema'
import { NotAuthorError } from '@/shared/application/errors/not-author.error'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

export abstract class BaseDeleteCommentController {
  constructor (
    private readonly deleteCommentUseCase: UseCase
  ) {}

  @Delete()
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete an comment' })
  @ApiNoContentResponse('Comment deleted successfully')
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiNotFoundResponse('Comment not found')
  @ApiUnprocessableEntityResponse()
  @ApiInternalServerErrorResponse()
  async handle (
    @CurrentUser() user: AuthUser,
    @Param(new ZodValidationPipe(deleteCommentParamsSchema)) params: DeleteCommentParamsDto
  ) {
    const { commentId } = params
    try {
      await this.deleteCommentUseCase.execute({
        commentId,
        authorId: user.id,
      })
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        throw new NotFoundException(error.message)
      }
      if (error instanceof NotAuthorError) {
        throw new ForbiddenException(error.message)
      }
      throw error
    }
  }
}
