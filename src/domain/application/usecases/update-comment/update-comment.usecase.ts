import { Inject, Injectable } from '@nestjs/common'
import { UseCase } from '@/core/domain/application/use-case'
import { CommentsRepository } from '@/domain/application/repositories/comments.repository'
import { NotAuthorError } from '@/shared/application/errors/not-author.error'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

type UpdateCommentRequest = {
  commentId: string
  authorId: string
  content: string
}

@Injectable()
export class UpdateCommentUseCase implements UseCase {
  constructor (
    @Inject(CommentsRepository) private readonly commentsRepository: CommentsRepository
  ) {}

  async execute (req: UpdateCommentRequest) {
    const { commentId, authorId, content } = req
    const comment = await this.commentsRepository.findById(commentId)
    if (!comment) {
      throw new ResourceNotFoundError('Comment')
    }
    if (comment.authorId !== authorId) {
      throw new NotAuthorError('comment')
    }
    const updatedComment = await this.commentsRepository.update({
      commentId,
      data: { content },
    })
    return updatedComment
  }
}
