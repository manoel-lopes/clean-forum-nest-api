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
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe'
import {
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@/infra/http/presentation/decorators/api-responses.decorator'
import { NotAuthorError } from '@/shared/application/errors/not-author.error'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'
import {
  type ChooseQuestionBestAnswerParams,
  chooseQuestionBestAnswerParamsSchema,
} from './ports/choose-question-best-answer.protocol'

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
