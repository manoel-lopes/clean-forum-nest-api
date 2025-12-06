import { Controller, Delete, HttpCode } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { DeleteQuestionCommentUseCase } from '@/domain/application/usecases/delete-question-comment/delete-question-comment.usecase'
import {
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@/presentation/decorators/api-responses.decorator'
import { BaseDeleteCommentController } from '../base/base-delete-comment.controller'

@ApiTags('Comments')
@Controller('questions/comments/:commentId')
export class DeleteQuestionCommentController extends BaseDeleteCommentController {
  constructor (deleteQuestionCommentUseCase: DeleteQuestionCommentUseCase) {
    super(deleteQuestionCommentUseCase)
  }

  @Delete()
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a question comment' })
  @ApiNoContentResponse('Comment deleted successfully')
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiNotFoundResponse('Comment not found')
  @ApiUnprocessableEntityResponse()
  @ApiInternalServerErrorResponse()
  override handle (...args: Parameters<BaseDeleteCommentController['handle']>) {
    return super.handle(...args)
  }
}
