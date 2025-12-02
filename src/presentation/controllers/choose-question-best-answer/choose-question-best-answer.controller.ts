import {
  Controller,
  ForbiddenException,
  NotFoundException,
  Param,
  Patch,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ChooseQuestionBestAnswerUseCase } from '@/domain/application/usecases/choose-question-best-answer/choose-question-best-answer.usecase'
import { CurrentUser } from '@/infra/auth/decorators/current-user.decorator'
import type { AuthUser } from '@/infra/auth/strategies/jwt.strategy'
import { ZodValidationPipe } from '@/infra/validation/pipes/zod-validation.pipe'
import {
  type ChooseQuestionBestAnswerParams,
  chooseQuestionBestAnswerParamsSchema,
} from '@/infra/validation/schemas/presentation/questions/choose-question-best-answer.schema'
import { NotAuthorException } from '@/shared/application/exceptions/not-author.exception'
import { ResourceNotFoundException } from '@/shared/application/exceptions/resource-not-found.exception'

@ApiTags('Questions')
@Controller('answers/:answerId/best')
export class ChooseQuestionBestAnswerController {
  constructor (private readonly chooseQuestionBestAnswerUseCase: ChooseQuestionBestAnswerUseCase) {}

  @Patch()
  async handle (
    @CurrentUser() user: AuthUser,
    @Param(new ZodValidationPipe(chooseQuestionBestAnswerParamsSchema)) params: ChooseQuestionBestAnswerParams
  ) {
    const { answerId } = params
    try {
      const question = await this.chooseQuestionBestAnswerUseCase.execute({
        answerId,
        authorId: user.id,
      })
      return question
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
