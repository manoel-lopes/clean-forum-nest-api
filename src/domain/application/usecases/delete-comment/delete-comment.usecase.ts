import { Inject, Injectable } from '@nestjs/common'
import { UseCase } from '@/core/domain/use-case'
import { AnswersRepository } from '@/domain/application/repositories/answers.repository'
import { CommentsRepository } from '@/domain/application/repositories/comments.repository'
import { NotAuthorException } from '@/shared/application/exceptions/not-author.exception'
import { ResourceNotFoundException } from '@/shared/application/exceptions/resource-not-found.exception'

type DeleteCommentRequest = {
  commentId: string
  authorId: string
}

@Injectable()
export class DeleteCommentUseCase implements UseCase {
  constructor (
    @Inject(CommentsRepository) private readonly commentsRepository: CommentsRepository,
    @Inject(AnswersRepository) private readonly answersRepository: AnswersRepository
  ) {}

  async execute (req: DeleteCommentRequest) {
    const { commentId, authorId } = req
    const comment = await this.commentsRepository.findById(commentId)
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
    await this.commentsRepository.delete(commentId)
  }
}
