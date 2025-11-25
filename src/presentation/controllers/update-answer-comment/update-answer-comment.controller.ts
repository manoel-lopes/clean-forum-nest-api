import { Controller } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UpdateCommentUseCase } from '@/domain/application/usecases/update-comment/update-comment.usecase'
import { BaseUpdateCommentController } from '../base/base-update-comment.controller'

@Controller('answers/comments/:commentId')
export class UpdateAnswerCommentController extends BaseUpdateCommentController {
  constructor (updateCommentUseCase: UpdateCommentUseCase, jwtService: JwtService) {
    super(updateCommentUseCase, jwtService)
  }
}
