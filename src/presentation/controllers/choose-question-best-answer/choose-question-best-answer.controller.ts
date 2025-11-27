import {
  Controller,
  ForbiddenException,
  NotFoundException,
  Param,
  Patch,
} from '@nestjs/common'
import { ChooseQuestionBestAnswerUseCase } from '@/domain/application/usecases/choose-question-best-answer/choose-question-best-answer.usecase'
import { CurrentUser } from '@/infra/auth/decorators/current-user.decorator'
import type { AuthUser } from '@/infra/auth/strategies/jwt.strategy'
import { NotAuthorError } from '@/shared/application/errors/not-author.error'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

@Controller('answers/:answerId/best')
export class ChooseQuestionBestAnswerController {
  constructor (private readonly chooseQuestionBestAnswerUseCase: ChooseQuestionBestAnswerUseCase) {}

  @Patch()
  async handle (
    @CurrentUser() user: AuthUser,
    @Param('answerId') answerId: string
  ) {
    try {
      const question = await this.chooseQuestionBestAnswerUseCase.execute({
        answerId,
        authorId: user.id,
      })
      return question
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
