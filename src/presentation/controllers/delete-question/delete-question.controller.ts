import {
  Controller,
  Delete,
  ForbiddenException,
  HttpCode,
  NotFoundException,
  Param,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { DeleteQuestionUseCase } from '@/domain/application/usecases/delete-question/delete-question.usecase'
import { CurrentUser } from '@/infra/auth/decorators/current-user.decorator'
import type { AuthUser } from '@/infra/auth/strategies/jwt.strategy'
import { ZodValidationPipe } from '@/infra/validation/pipes/zod-validation.pipe'
import {
  type DeleteQuestionParams,
  deleteQuestionParamsSchema,
} from '@/infra/validation/schemas/presentation/questions/delete-question.schema'
import { NotAuthorError } from '@/shared/application/errors/not-author.error'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

@ApiTags('Questions')
@Controller('questions/:questionId')
export class DeleteQuestionController {
  constructor (private readonly deleteQuestionUseCase: DeleteQuestionUseCase) {}

  @Delete()
  @HttpCode(204)
  async handle (
    @CurrentUser() user: AuthUser,
    @Param(new ZodValidationPipe(deleteQuestionParamsSchema)) params: DeleteQuestionParams
  ) {
    const { questionId } = params
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
