import { Controller } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { DeleteQuestionCommentUseCase } from '@/domain/application/usecases/delete-question-comment/delete-question-comment.usecase'
import { BaseDeleteCommentController } from '../base/base-delete-comment.controller'

@Controller('questions/comments/:commentId')
export class DeleteQuestionCommentController extends BaseDeleteCommentController {
  constructor (deleteQuestionCommentUseCase: DeleteQuestionCommentUseCase, jwtService: JwtService) {
    super(deleteQuestionCommentUseCase, jwtService)
  }
}
