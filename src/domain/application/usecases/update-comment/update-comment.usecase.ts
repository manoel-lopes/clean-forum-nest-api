import type { UseCase } from '@/core/domain/application/use-case'
import type { CommentsRepository } from '@/domain/application/repositories/base/comments.repository'
import type { Comment } from '@/domain/enterprise/entities/base/comment.entity'
import { NotAuthorError } from '@/shared/application/errors/not-author.error'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

type UpdateCommentRequest = {
  commentId: string
  authorId: string
  content: string
}

export class UpdateCommentUseCase implements UseCase {
  constructor (private readonly commentRepository: CommentsRepository) {}

  async execute (req: UpdateCommentRequest): Promise<Comment> {
    const { commentId, authorId, content } = req
    const comment = await this.commentRepository.findById(commentId)
    if (!comment) {
      throw new ResourceNotFoundError('Comment')
    }
    if (comment.authorId !== authorId) {
      throw new NotAuthorError('comment')
    }
    const updatedComment = await this.commentRepository.update({
      where: { id: commentId },
      data: { content },
    })
    return updatedComment
  }
}
