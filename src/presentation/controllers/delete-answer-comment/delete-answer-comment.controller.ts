import { Controller, Delete, HttpCode } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { DeleteAnswerCommentUseCase } from '@/domain/application/usecases/delete-answer-comment/delete-answer-comment.usecase'
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
@Controller('answers/comments/:commentId')
export class DeleteAnswerCommentController extends BaseDeleteCommentController {
  constructor (deleteAnswerCommentUseCase: DeleteAnswerCommentUseCase) {
    super(deleteAnswerCommentUseCase)
  }

  @Delete()
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete an answer comment' })
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
