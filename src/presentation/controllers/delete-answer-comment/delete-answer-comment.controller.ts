import { Controller } from '@nestjs/common'
import { DeleteAnswerCommentUseCase } from '@/domain/application/usecases/delete-answer-comment/delete-answer-comment.usecase'
import { BaseDeleteCommentController } from '../base/base-delete-comment.controller'

@Controller('answers/comments/:commentId')
export class DeleteAnswerCommentController extends BaseDeleteCommentController {
  constructor (deleteAnswerCommentUseCase: DeleteAnswerCommentUseCase) {
    super(deleteAnswerCommentUseCase)
  }
}
