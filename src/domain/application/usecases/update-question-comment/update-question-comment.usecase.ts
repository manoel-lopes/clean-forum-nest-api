import { Inject, Injectable } from '@nestjs/common'
import { UseCase } from '@/core/domain/use-case'
import { QuestionCommentsRepository } from '@/domain/application/repositories/question-comments.repository'
import { BaseUpdateCommentUseCase } from '../base/base-update-comment-use-case'

@Injectable()
export class UpdateQuestionCommentUseCase extends BaseUpdateCommentUseCase implements UseCase {
  constructor (
    @Inject(QuestionCommentsRepository) answerCommentsRepository: QuestionCommentsRepository
  ) {
    super(answerCommentsRepository)
  }
}
