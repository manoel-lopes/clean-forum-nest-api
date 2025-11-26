import { Controller } from '@nestjs/common'
import { UpdateCommentUseCase } from '@/domain/application/usecases/update-comment/update-comment.usecase'
import { BaseUpdateCommentController } from '../base/base-update-comment.controller'

@Controller('questions/comments/:commentId')
export class UpdateQuestionCommentController extends BaseUpdateCommentController {
  constructor (updateCommentUseCase: UpdateCommentUseCase) {
    super(updateCommentUseCase)
  }
}
