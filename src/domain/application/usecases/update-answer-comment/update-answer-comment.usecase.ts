import { Inject, Injectable } from '@nestjs/common'
import { UseCase } from '@/core/domain/use-case'
import { AnswerCommentsRepository } from '@/domain/application/repositories/answer-comments.repository'
import { BaseUpdateCommentUseCase } from '../base/base-update-comment-use-case'

@Injectable()
export class UpdateAnswerCommentUseCase extends BaseUpdateCommentUseCase implements UseCase {
  constructor (
    @Inject(AnswerCommentsRepository) answerCommentsRepository: AnswerCommentsRepository
  ) {
    super(answerCommentsRepository)
  }
}
