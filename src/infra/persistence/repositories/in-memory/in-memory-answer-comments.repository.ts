import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type {
  AnswerCommentsRepository,
  PaginatedAnswerComments,
} from '@/domain/application/repositories/answer-comments.repository'
import type { AnswerComment } from '@/domain/enterprise/entities/answer-comment.entity'
import { InMemoryCommentsRepository } from './in-memory-comments.repository'

export class InMemoryAnswerCommentsRepository
  extends InMemoryCommentsRepository<AnswerComment>
  implements AnswerCommentsRepository {
  async findManyByAnswerId (answerId: string, params: PaginationParams): Promise<PaginatedAnswerComments> {
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
