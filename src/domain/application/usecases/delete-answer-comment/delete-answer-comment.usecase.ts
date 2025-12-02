import { Inject, Injectable } from '@nestjs/common'
import { UseCase } from '@/core/domain/application/use-case'
import { AnswerCommentsRepository } from '@/domain/application/repositories/answer-comments.repository'
import { AnswersRepository } from '@/domain/application/repositories/answers.repository'
import { NotAuthorException } from '@/shared/application/exceptions/not-author.exception'
import { ResourceNotFoundException } from '@/shared/application/exceptions/resource-not-found.exception'

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
      throw new ResourceNotFoundException('Comment')
    }
    const answer = await this.answersRepository.findById(comment.answerId)
    if (!answer) {
      throw new ResourceNotFoundException('Answer')
    }
    const isCommentAuthor = comment.authorId === authorId
    const isAnswerAuthor = answer.authorId === authorId
    if (!isCommentAuthor && !isAnswerAuthor) {
      throw new NotAuthorException('comment')
    }
    await this.answerCommentsRepository.delete(commentId)
  }
}
