import {
  Controller,
  ForbiddenException,
  NotFoundException,
  Param,
  Patch,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { ChooseQuestionBestAnswerUseCase } from '@/domain/application/usecases/choose-question-best-answer/choose-question-best-answer.usecase'
import { CurrentUser } from '@/infra/auth/decorators/current-user.decorator'
import type { AuthUser } from '@/infra/auth/strategies/jwt.strategy'
import { ZodValidationPipe } from '@/infra/validation/pipes/zod-validation.pipe'
import {
  ChooseQuestionBestAnswerParamsDto,
  chooseQuestionBestAnswerParamsSchema,
} from '@/infra/validation/schemas/presentation/questions/choose-question-best-answer.schema'
import {
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@/presentation/decorators/api-responses.decorator'
import { NotAuthorException } from '@/shared/application/exceptions/not-author.exception'
import { ResourceNotFoundException } from '@/shared/application/exceptions/resource-not-found.exception'

@ApiTags('Questions')
@Controller('answers/:answerId/best')
export class ChooseQuestionBestAnswerController {
  constructor (private readonly chooseQuestionBestAnswerUseCase: ChooseQuestionBestAnswerUseCase) {}

  @Patch()
  @ApiOperation({ summary: 'Choose best answer for a question' })
  @ApiOkResponse('Best answer chosen successfully')
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiNotFoundResponse('Answer not found')
  @ApiUnprocessableEntityResponse()
  @ApiInternalServerErrorResponse()
  async handle (
    @CurrentUser() user: AuthUser,
    @Param(new ZodValidationPipe(chooseQuestionBestAnswerParamsSchema)) params: ChooseQuestionBestAnswerParamsDto
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
