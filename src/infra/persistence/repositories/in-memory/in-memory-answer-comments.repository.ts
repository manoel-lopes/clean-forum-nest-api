import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type {
  AnswerCommentsRepository,
  PaginatedAnswerComments,
} from '@/domain/application/repositories/answer-comments.repository'
import type { Comment } from '@/domain/enterprise/entities/base/comment.entity'
import { InMemoryCommentsRepository } from './in-memory-comments.repository'

export class InMemoryAnswerCommentsRepository
  extends InMemoryCommentsRepository
  implements AnswerCommentsRepository {
  async findManyByAnswerId (answerId: string, params: PaginationParams): Promise<PaginatedAnswerComments> {
    return this.findManyItemsBy({
      where: { answerId },
      params: {
        page: params.page,
        pageSize: params.pageSize,
        order: params.order,
      },
    })
  }

  override async findById (commentId: string): Promise<Comment | null> {
    const comment = await super.findById(commentId)
    if (!comment || !comment.answerId) return null
    return comment
  }
}
