import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import {
  Body,
  Controller,
  HttpCode,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { AnswerQuestionUseCase } from '@/domain/application/usecases/answer-question/answer-question.usecase'
import { CurrentUser } from '@/infra/auth/decorators/current-user.decorator'
import type { AuthUser } from '@/infra/auth/strategies/jwt.strategy'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

const answerQuestionParamsSchema = z.object({
  questionId: z.uuid(),
})
const answerQuestionBodySchema = z.object({
  content: z.string().min(1),
})

class AnswerQuestionParamsDto extends createZodDto(answerQuestionParamsSchema) {}
class AnswerQuestionBodyDto extends createZodDto(answerQuestionBodySchema) {}

@ApiTags('Answers')
@Controller('questions/:questionId/answers')
export class AnswerQuestionController {
  constructor (private readonly answerQuestionUseCase: AnswerQuestionUseCase) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Answer a question' })
  async handle (
    @CurrentUser() user: AuthUser,
    @Param(new ZodValidationPipe(answerQuestionParamsSchema)) params: AnswerQuestionParamsDto,
    @Body(new ZodValidationPipe(answerQuestionBodySchema)) body: AnswerQuestionBodyDto
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
      if (error instanceof ResourceNotFoundError) {
        throw new NotFoundException(error.message)
      }
      throw error
    }
  }
}
