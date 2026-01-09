import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type {
  CommentsRepository,
  PaginatedComments,
  UpdateCommentData,
} from '@/domain/application/repositories/comments.repository'
import type { Comment } from '@/domain/enterprise/entities/comment.entity'
import { BaseInMemoryRepository as BaseRepository } from './base/base-in-memory.repository'

export class InMemoryCommentsRepository
  extends BaseRepository<Comment>
  implements CommentsRepository {
  async update (commentData: UpdateCommentData): Promise<Comment> {
    const { commentId, data } = commentData
    const updatedComment = await this.updateOne({ entityId: commentId, data })
    return updatedComment
  }

  async findManyByAnswerId (answerId: string, params: PaginationParams): Promise<PaginatedComments> {
    const comments = await this.findManyItemsBy({
      where: { answerId },
      params: {
        page: params.page,
        pageSize: params.pageSize,
        order: params.order,
      },
    })
    return comments
  }
}
