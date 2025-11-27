import { Controller } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { DeleteQuestionCommentUseCase } from '@/domain/application/usecases/delete-question-comment/delete-question-comment.usecase'
import { BaseDeleteCommentController } from '../base/base-delete-comment.controller'

@ApiTags('Comments')
@Controller('questions/comments/:commentId')
export class DeleteQuestionCommentController extends BaseDeleteCommentController {
  constructor (deleteQuestionCommentUseCase: DeleteQuestionCommentUseCase) {
    super(deleteQuestionCommentUseCase)
  }
}
