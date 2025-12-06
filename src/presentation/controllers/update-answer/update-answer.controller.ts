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
import { ZodValidationPipe } from '@/infra/validation/pipes/zod-validation.pipe'
import {
  UpdateAnswerBodyDto,
  updateAnswerBodySchema,
  UpdateAnswerParamsDto,
  updateAnswerParamsSchema,
} from '@/infra/validation/schemas/presentation/answers/update-answer.schema'
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@/presentation/decorators/api-responses.decorator'
import { NotAuthorException } from '@/shared/application/exceptions/not-author.exception'
import { ResourceNotFoundException } from '@/shared/application/exceptions/resource-not-found.exception'

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
