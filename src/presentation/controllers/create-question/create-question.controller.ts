import {
  Body,
  ConflictException,
  Controller,
  HttpCode,
  NotFoundException,
  Post,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { CreateQuestionUseCase } from '@/domain/application/usecases/create-question/create-question.usecase'
import { QuestionWithTitleAlreadyRegisteredError } from '@/domain/application/usecases/create-question/errors/question-with-title-already-registered.error'
import { CurrentUser } from '@/infra/auth/decorators/current-user.decorator'
import type { AuthUser } from '@/infra/auth/strategies/jwt.strategy'
import { ZodValidationPipe } from '@/infra/validation/pipes/zod-validation.pipe'
import {
  type CreateQuestionBody,
  createQuestionBodySchema,
} from '@/infra/validation/schemas/presentation/questions/create-question.schema'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

@ApiTags('Questions')
@Controller('questions')
export class CreateQuestionController {
  constructor (private readonly createQuestionUseCase: CreateQuestionUseCase) {}

  @Post()
  @HttpCode(201)
  async handle (
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(createQuestionBodySchema)) body: CreateQuestionBody
  ) {
    try {
      const { title, content } = body
      const question = await this.createQuestionUseCase.execute({ title, content, authorId: user.id })
      return question
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        throw new NotFoundException(error.message)
      }
      if (error instanceof QuestionWithTitleAlreadyRegisteredError) {
        throw new ConflictException(error.message)
      }
      throw error
    }
  }
}
