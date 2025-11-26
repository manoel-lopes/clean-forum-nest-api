import {
  Delete,
  ForbiddenException,
  HttpCode,
  NotFoundException,
  Param,
} from '@nestjs/common'
import { UseCase } from '@/core/domain/application/use-case'
import { CurrentUser } from '@/infra/auth/decorators/current-user.decorator'
import type { AuthUser } from '@/infra/auth/strategies/jwt.strategy'
import { NotAuthorError } from '@/shared/application/errors/not-author.error'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

export abstract class BaseDeleteCommentController {
  constructor (
    protected readonly deleteCommentUseCase: UseCase
  ) {}

  @Delete()
  @HttpCode(204)
  async handle (
    @CurrentUser() user: AuthUser,
    @Param('commentId') commentId: string
  ) {
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
