import {
  Body,
  ForbiddenException,
  NotFoundException,
  Param,
  Put,
} from '@nestjs/common'
import { UseCase } from '@/core/domain/application/use-case'
import { CurrentUser } from '@/infra/auth/decorators/current-user.decorator'
import type { AuthUser } from '@/infra/auth/strategies/jwt.strategy'
import { NotAuthorError } from '@/shared/application/errors/not-author.error'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

type UpdateCommentBody = {
  content: string
}

export abstract class BaseUpdateCommentController {
  constructor (
    protected readonly updateCommentUseCase: UseCase
  ) {}

  @Put()
  async handle (
    @CurrentUser() user: AuthUser,
    @Param('commentId') commentId: string,
    @Body() body: UpdateCommentBody
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
