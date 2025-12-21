import type { CommentsRepository, UpdateCommentData } from '@/domain/application/repositories/base/comments.repository'
import { Comment } from '@/domain/enterprise/entities/base/comment.entity'
import { BaseInMemoryRepository as BaseRepository } from './base/base-in-memory.repository'

export class InMemoryCommentsRepository
  extends BaseRepository<Comment>
  implements CommentsRepository<Comment> {
  async update ({ commentId, data }: UpdateCommentData): Promise<Comment> {
    const updatedComment = await this.updateOne({ id: commentId, ...data })
    return updatedComment
  }
}
