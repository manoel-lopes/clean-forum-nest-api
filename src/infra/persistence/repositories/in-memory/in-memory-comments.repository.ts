import type { CommentsRepository, UpdateCommentData } from '@/domain/application/repositories/base/comments.repository'
import { Comment } from '@/domain/enterprise/entities/base/comment.entity'
import { BaseInMemoryRepository as BaseRepository } from './base/base-in-memory.repository'

export class InMemoryCommentsRepository
  extends BaseRepository<Comment>
  implements CommentsRepository<Comment> {
  async update (commentData: UpdateCommentData): Promise<Comment> {
    const { where, data } = commentData
    const updatedComment = await this.updateOne({ where, data })
    return updatedComment
  }
}
