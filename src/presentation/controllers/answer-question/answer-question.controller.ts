import {
  Body,
  Controller,
  HttpCode,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { AnswerQuestionUseCase } from '@/domain/application/usecases/answer-question/answer-question.usecase'
import { CurrentUser } from '@/infra/auth/decorators/current-user.decorator'
import type { AuthUser } from '@/infra/auth/strategies/jwt.strategy'
import { ZodValidationPipe } from '@/infra/validation/pipes/zod-validation.pipe'
import {
  type AnswerQuestionBody,
  answerQuestionBodySchema,
  type AnswerQuestionParams,
  answerQuestionParamsSchema,
} from '@/infra/validation/schemas/presentation/answers/answer-question.schema'
import { ResourceNotFoundException } from '@/shared/application/exceptions/resource-not-found.exception'

@ApiTags('Answers')
@Controller('questions/:questionId/answers')
export class AnswerQuestionController {
  constructor (private readonly answerQuestionUseCase: AnswerQuestionUseCase) {}

  @Post()
  @HttpCode(201)
  async handle (
    @CurrentUser() user: AuthUser,
    @Param(new ZodValidationPipe(answerQuestionParamsSchema)) params: AnswerQuestionParams,
    @Body(new ZodValidationPipe(answerQuestionBodySchema)) body: AnswerQuestionBody
  ) {
    const { questionId } = params
    try {
      const { content } = body
      const answer = await this.answerQuestionUseCase.execute({
        authorId: user.id,
        questionId,
        content,
      })
      return answer
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        throw new NotFoundException(error.message)
      }
      throw error
    }
  }
}
