import { Inject, Injectable } from '@nestjs/common'
import { UseCase } from '@/core/domain/use-case'
import { CommentsRepository } from '@/domain/application/repositories/comments.repository'
import { NotAuthorException } from '@/shared/application/exceptions/not-author.exception'
import { ResourceNotFoundException } from '@/shared/application/exceptions/resource-not-found.exception'

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
      throw new ResourceNotFoundException('Comment')
    }
    if (comment.authorId !== authorId) {
      throw new NotAuthorException('comment')
    }
    const updatedComment = await this.commentsRepository.update({
      where: { id: commentId },
      data: { content },
    })
    return updatedComment
  }
}
