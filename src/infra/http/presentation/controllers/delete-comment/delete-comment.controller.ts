import {
  Controller,
  Delete,
  ForbiddenException,
  HttpCode,
  NotFoundException,
  Param,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { DeleteCommentUseCase } from '@/domain/application/usecases/delete-comment/delete-comment.usecase'
import { CurrentUser } from '@/infra/auth/decorators/current-user.decorator'
import type { AuthUser } from '@/infra/auth/strategies/jwt.strategy'
import {
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '@/infra/http/presentation/decorators/api-responses.decorator'
import { NotAuthorException } from '@/shared/application/exceptions/not-author.exception'
import { ResourceNotFoundException } from '@/shared/application/exceptions/resource-not-found.exception'

@ApiTags('Comments')
@Controller('comments')
export class DeleteCommentController {
  constructor (private readonly deleteCommentUseCase: DeleteCommentUseCase) {}

  @Delete(':commentId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiNoContentResponse('Comment deleted successfully')
  @ApiUnauthorizedResponse()
  @ApiNotFoundResponse('Comment not found')
  @ApiInternalServerErrorResponse()
  async handle (
    @CurrentUser() user: AuthUser,
    @Param('commentId') commentId: string
  ) {
    try {
      await this.deleteCommentUseCase.execute({
        commentId,
        authorId: user.id,
      })
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
