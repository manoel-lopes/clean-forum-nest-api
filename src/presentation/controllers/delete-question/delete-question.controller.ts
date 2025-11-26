import {
  Controller,
  Delete,
  ForbiddenException,
  HttpCode,
  NotFoundException,
  Param,
} from '@nestjs/common'
import { DeleteQuestionUseCase } from '@/domain/application/usecases/delete-question/delete-question.usecase'
import { CurrentUser } from '@/infra/auth/decorators/current-user.decorator'
import type { AuthUser } from '@/infra/auth/strategies/jwt.strategy'
import { NotAuthorError } from '@/shared/application/errors/not-author.error'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

@Controller('questions/:questionId')
export class DeleteQuestionController {
  constructor (private readonly deleteQuestionUseCase: DeleteQuestionUseCase) {}

  @Delete()
  @HttpCode(204)
  async handle (
    @CurrentUser() user: AuthUser,
    @Param('questionId') questionId: string
  ) {
    try {
      await this.deleteQuestionUseCase.execute({
        questionId,
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
