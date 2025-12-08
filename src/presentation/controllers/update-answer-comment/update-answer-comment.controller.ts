import { Controller } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { UpdateAnswerCommentUseCase } from '@/domain/application/usecases/update-answer-comment/update-answer-comment.usecase'
import { BaseUpdateCommentController } from '../base/base-update-comment.controller'

@ApiTags('Comments')
@Controller('answers/comments/:commentId')
export class UpdateAnswerCommentController extends BaseUpdateCommentController {
  constructor (updateCommentUseCase: UpdateAnswerCommentUseCase) {
    super(updateCommentUseCase)
  }
}
