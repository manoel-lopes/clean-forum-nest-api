import { Inject, Injectable } from '@nestjs/common'
import { UseCase } from '@/core/domain/application/use-case'
import { AnswerCommentsRepository } from '@/domain/application/repositories/answer-comments.repository'
import { AnswersRepository } from '@/domain/application/repositories/answers.repository'
import { NotAuthorError } from '@/shared/application/errors/not-author.error'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

type DeleteAnswerCommentRequest = {
  commentId: string
  authorId: string
}

@Injectable()
export class DeleteAnswerCommentUseCase implements UseCase {
  constructor (
    @Inject(AnswerCommentsRepository) private readonly answerCommentsRepository: AnswerCommentsRepository,
    @Inject(AnswersRepository) private readonly answersRepository: AnswersRepository
  ) {}

  async execute (req: DeleteAnswerCommentRequest) {
    const { commentId, authorId } = req
    const comment = await this.answerCommentsRepository.findById(commentId)
    if (!comment) {
      throw new ResourceNotFoundError('Comment')
    }
    const answer = await this.answersRepository.findById(comment.answerId)
    if (!answer) {
      throw new ResourceNotFoundError('Answer')
    }
    const isCommentAuthor = comment.authorId === authorId
    const isAnswerAuthor = answer.authorId === authorId
    if (!isCommentAuthor && !isAnswerAuthor) {
      throw new NotAuthorError('comment')
    }
    await this.answerCommentsRepository.delete(commentId)
  }
}
