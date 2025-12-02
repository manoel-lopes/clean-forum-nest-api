import {
  Body,
  Controller,
  ForbiddenException,
  NotFoundException,
  Param,
  Put,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { UpdateQuestionUseCase } from '@/domain/application/usecases/update-question/update-question.usecase'
import { CurrentUser } from '@/infra/auth/decorators/current-user.decorator'
import type { AuthUser } from '@/infra/auth/strategies/jwt.strategy'
import { ZodValidationPipe } from '@/infra/validation/pipes/zod-validation.pipe'
import {
  type UpdateQuestionBody,
  updateQuestionBodySchema,
  type UpdateQuestionParams,
  updateQuestionParamsSchema,
} from '@/infra/validation/schemas/presentation/questions/update-question.schema'
import { NotAuthorException } from '@/shared/application/exceptions/not-author.exception'
import { ResourceNotFoundException } from '@/shared/application/exceptions/resource-not-found.exception'

@ApiTags('Questions')
@Controller('questions/:questionId')
export class UpdateQuestionController {
  constructor (private readonly updateQuestionUseCase: UpdateQuestionUseCase) {}

  @Put()
  async handle (
    @CurrentUser() user: AuthUser,
    @Param(new ZodValidationPipe(updateQuestionParamsSchema)) params: UpdateQuestionParams,
    @Body(new ZodValidationPipe(updateQuestionBodySchema)) body: UpdateQuestionBody
  ) {
    const { questionId } = params
    try {
      const { title, content } = body
      const question = await this.updateQuestionUseCase.execute({
        questionId,
        title,
        content,
        authorId: user.id,
      })
      return { question }
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
