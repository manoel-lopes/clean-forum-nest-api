import type { PaginationParams } from '@/core/domain/pagination-params'
import type {
  CommentsRepository,
  PaginatedComments,
  UpdateCommentData,
} from '@/domain/application/repositories/comments.repository'
import { Comment, CommentProps } from '@/domain/enterprise/entities/comment/comment.entity'
import { BaseInMemoryRepository as BaseRepository } from './base/base-in-memory.repository'

export class InMemoryCommentsRepository
  extends BaseRepository<Comment>
  implements CommentsRepository {
  async create (data: CommentProps): Promise<Comment> {
    const comment = Comment.create(data)
    await this.save(comment)
    return comment
  }

  async findManyByAnswerId (answerId: string, params: PaginationParams): Promise<PaginatedComments> {
    const result = await this.findManyItemsBy({
      where: { answerId } as Partial<Comment>,
      params,
    })
    return result as PaginatedComments
  }

  async update ({ where, data }: UpdateCommentData): Promise<Comment> {
    const updatedComment = await this.updateOne({ id: where.id, ...data })
    return updatedComment
  }
}
