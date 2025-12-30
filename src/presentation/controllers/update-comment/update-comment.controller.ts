import {
  Body,
  Controller,
  ForbiddenException,
  NotFoundException,
  Param,
  Put,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { UpdateCommentUseCase } from '@/domain/application/usecases/update-comment/update-comment.usecase'
import { CurrentUser } from '@/infra/auth/decorators/current-user.decorator'
import type { AuthUser } from '@/infra/auth/strategies/jwt.strategy'
import { ZodValidationPipe } from '@/infra/validation/pipes/zod-validation.pipe'
import {
  UpdateCommentBodyDto,
  updateCommentBodySchema,
  UpdateCommentParamsDto,
  updateCommentParamsSchema,
} from '@/infra/validation/schemas/presentation/comments/update-comment.schema'
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

@ApiTags('Comments')
@Controller('comments/:commentId')
export class UpdateCommentController {
  constructor (private readonly updateCommentUseCase: UpdateCommentUseCase) {}

  @Put()
  @ApiOperation({ summary: 'Update a comment' })
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
