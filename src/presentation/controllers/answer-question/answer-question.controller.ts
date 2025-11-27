import {
  Body,
  Controller,
  HttpCode,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common'
import { AnswerQuestionUseCase } from '@/domain/application/usecases/answer-question/answer-question.usecase'
import { CurrentUser } from '@/infra/auth/decorators/current-user.decorator'
import type { AuthUser } from '@/infra/auth/strategies/jwt.strategy'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

type AnswerQuestionBody = {
  content: string
}

@Controller('questions/:questionId/answers')
export class AnswerQuestionController {
  constructor (private readonly answerQuestionUseCase: AnswerQuestionUseCase) {}

  @Post()
  @HttpCode(201)
  async handle (
    @CurrentUser() user: AuthUser,
    @Param('questionId') questionId: string,
    @Body() body: AnswerQuestionBody
  ) {
    try {
      const { content } = body
      const answer = await this.answerQuestionUseCase.execute({
        authorId: user.id,
        questionId,
        content,
      })
      return answer
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        throw new NotFoundException(error.message)
      }
      throw error
    }
  }
}
