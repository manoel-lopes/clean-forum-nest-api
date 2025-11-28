import { Controller } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { UpdateCommentUseCase } from '@/domain/application/usecases/update-comment/update-comment.usecase'
import { BaseUpdateCommentController } from '../base/base-update-comment.controller'

@ApiTags('Comments')
@Controller('answers/comments/:commentId')
export class UpdateAnswerCommentController extends BaseUpdateCommentController {
  constructor (updateCommentUseCase: UpdateCommentUseCase) {
    super(updateCommentUseCase)
  }
}
