import { Controller } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { UpdateQuestionCommentUseCase } from '@/domain/application/usecases/update-question-comment/update-question-comment.usecase'
import { BaseUpdateCommentController } from '../base/base-update-comment.controller'

@ApiTags('Comments')
@Controller('questions/comments/:commentId')
export class UpdateQuestionCommentController extends BaseUpdateCommentController {
  constructor (updateCommentUseCase: UpdateQuestionCommentUseCase) {
    super(updateCommentUseCase)
  }
}
