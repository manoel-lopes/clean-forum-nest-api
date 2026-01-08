import {
  Body,
  Controller,
  ForbiddenException,
  NotFoundException,
  Param,
  Put,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { UpdateAnswerUseCase } from '@/domain/application/usecases/update-answer/update-answer.usecase'
import { CurrentUser } from '@/infra/auth/decorators/current-user.decorator'
import type { AuthUser } from '@/infra/auth/strategies/jwt.strategy'
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@/infra/http/presentation/decorators/api-responses.decorator'
import { ZodValidationPipe } from '@/infra/http/presentation/pipes/schemas/zod-validation.pipe'
import { NotAuthorError } from '@/shared/application/errors/not-author.error'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'
import {
  UpdateAnswerBodyDto,
  updateAnswerBodySchema,
  UpdateAnswerParamsDto,
  updateAnswerParamsSchema,
} from './ports/update-answer.protocol'

@ApiTags('Answers')
@Controller('answers/:answerId')
export class UpdateAnswerController {
  constructor (private readonly updateAnswerUseCase: UpdateAnswerUseCase) {}

  @Put()
  @ApiOperation({ summary: 'Update an answer' })
  @ApiOkResponse('Answer updated successfully')
  @ApiUnauthorizedResponse()
  @ApiBadRequestResponse()
  @ApiForbiddenResponse()
  @ApiNotFoundResponse('Answer not found')
  @ApiUnprocessableEntityResponse()
  @ApiInternalServerErrorResponse()
  async handle (
    @CurrentUser() user: AuthUser,
    @Param(new ZodValidationPipe(updateAnswerParamsSchema)) params: UpdateAnswerParamsDto,
    @Body(new ZodValidationPipe(updateAnswerBodySchema)) body: UpdateAnswerBodyDto
  ) {
    const { answerId } = params
    try {
      const { content } = body
      const answer = await this.updateAnswerUseCase.execute({
        answerId,
        content,
        authorId: user.id,
      })
      return { answer }
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
