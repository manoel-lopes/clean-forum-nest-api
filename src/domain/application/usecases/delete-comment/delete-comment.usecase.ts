import { Inject, Injectable } from '@nestjs/common'
import { UseCase } from '@/core/domain/application/use-case'
import { AnswersRepository } from '@/domain/application/repositories/answers.repository'
import { CommentsRepository } from '@/domain/application/repositories/comments.repository'
import { NotAuthorError } from '@/shared/application/errors/not-author.error'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

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
    await this.commentsRepository.delete(commentId)
  }
}
