import {
  Body,
  ConflictException,
  Controller,
  HttpCode,
  NotFoundException,
  Post,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { CreateQuestionUseCase } from '@/domain/application/usecases/create-question/create-question.usecase'
import { QuestionWithTitleAlreadyRegisteredException } from '@/domain/application/usecases/create-question/exceptions/question-with-title-already-registered.exception'
import { CurrentUser } from '@/infra/auth/decorators/current-user.decorator'
import type { AuthUser } from '@/infra/auth/strategies/jwt.strategy'
import { ZodValidationPipe } from '@/infra/validation/pipes/zod-validation.pipe'
import {
  CreateQuestionBodyDto,
  createQuestionBodySchema,
} from '@/infra/validation/schemas/presentation/questions/create-question.schema'
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiUnauthorizedResponse,
} from '@/presentation/decorators/api-responses.decorator'
import { ResourceNotFoundException } from '@/shared/application/exceptions/resource-not-found.exception'

@ApiTags('Questions')
@Controller('questions')
export class CreateQuestionController {
  constructor (private readonly createQuestionUseCase: CreateQuestionUseCase) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a new question' })
  @ApiCreatedResponse('Question created successfully')
  @ApiUnauthorizedResponse()
  @ApiConflictResponse('Question with title already exists')
  @ApiInternalServerErrorResponse()
  async handle (
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(createQuestionBodySchema)) body: CreateQuestionBodyDto
  ) {
    try {
      const { title, content } = body
      const question = await this.createQuestionUseCase.execute({ title, content, authorId: user.id })
      return question
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        throw new NotFoundException(error.message)
      }
      if (error instanceof QuestionWithTitleAlreadyRegisteredException) {
        throw new ConflictException(error.message)
      }
      throw error
    }
  }
}
