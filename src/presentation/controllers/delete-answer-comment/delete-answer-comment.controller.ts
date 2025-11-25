import { Controller } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { DeleteAnswerCommentUseCase } from '@/domain/application/usecases/delete-answer-comment/delete-answer-comment.usecase'
import { BaseDeleteCommentController } from '../base/base-delete-comment.controller'

@Controller('answers/comments/:commentId')
export class DeleteAnswerCommentController extends BaseDeleteCommentController {
  constructor (deleteAnswerCommentUseCase: DeleteAnswerCommentUseCase, jwtService: JwtService) {
    super(deleteAnswerCommentUseCase, jwtService)
  }
}
