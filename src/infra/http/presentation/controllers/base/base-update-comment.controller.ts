import {
  Body,
  ForbiddenException,
  NotFoundException,
  Param,
  Put,
} from '@nestjs/common'
import { ApiOperation } from '@nestjs/swagger'
import { UseCase } from '@/core/domain/use-case'
import { CurrentUser } from '@/infra/auth/decorators/current-user.decorator'
import type { AuthUser } from '@/infra/auth/strategies/jwt.strategy'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe'
import { ApiForbiddenResponse, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse, ApiUnauthorizedResponse, ApiUnprocessableEntityResponse } from '@/infra/http/presentation/decorators/api-responses.decorator'
import {
  UpdateCommentBodyDto,
  updateCommentBodySchema,
  UpdateCommentParamsDto,
  updateCommentParamsSchema,
} from '@/infra/http/ports/comments/update-comment.schema'
import { NotAuthorError } from '@/shared/application/errors/not-author.error'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

export abstract class BaseUpdateCommentController {
  constructor (
    private readonly updateCommentUseCase: UseCase
  ) {}

  @Put()
  @ApiOperation({ summary: 'Update an comment' })
  @ApiOkResponse('Comment updated successfully')
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiNotFoundResponse('Comment not found')
  @ApiUnprocessableEntityResponse()
  @ApiInternalServerErrorResponse()
  async handle (
    @CurrentUser() user: AuthUser,
    @Param(new ZodValidationPipe(updateCommentParamsSchema)) params: UpdateCommentParamsDto,
    @Body(new ZodValidationPipe(updateCommentBodySchema)) body: UpdateCommentBodyDto
  ) {
    const { commentId } = params
    try {
      const { content } = body
      const response = await this.updateCommentUseCase.execute({
        commentId,
        authorId: user.id,
        content,
      })
      return response
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
