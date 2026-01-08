import {
  Body,
  Controller,
  ForbiddenException,
  NotFoundException,
  Param,
  Put,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { UpdateQuestionUseCase } from '@/domain/application/usecases/update-question/update-question.usecase'
import { CurrentUser } from '@/infra/auth/decorators/current-user.decorator'
import type { AuthUser } from '@/infra/auth/strategies/jwt.strategy'
import {
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@/infra/http/presentation/decorators/api-responses.decorator'
import { ZodValidationPipe } from '@/infra/http/presentation/pipes/schemas/zod-validation.pipe'
import { NotAuthorError } from '@/shared/application/errors/not-author.error'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'
import {
  UpdateQuestionBodyDto,
  updateQuestionBodySchema,
  UpdateQuestionParamsDto,
  updateQuestionParamsSchema,
} from './ports/update-question.protocol'

@ApiTags('Questions')
@Controller('questions/:questionId')
export class UpdateQuestionController {
  constructor (private readonly updateQuestionUseCase: UpdateQuestionUseCase) {}

  @Put()
  @ApiOperation({ summary: 'Update a question' })
  @ApiOkResponse('Question updated successfully')
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiNotFoundResponse('Question not found')
  @ApiInternalServerErrorResponse()
  async handle (
    @CurrentUser() user: AuthUser,
    @Param(new ZodValidationPipe(updateQuestionParamsSchema)) params: UpdateQuestionParamsDto,
    @Body(new ZodValidationPipe(updateQuestionBodySchema)) body: UpdateQuestionBodyDto
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
