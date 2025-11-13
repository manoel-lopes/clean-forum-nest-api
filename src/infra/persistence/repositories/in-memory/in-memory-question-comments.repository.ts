import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type {
  PaginatedQuestionComments,
  QuestionCommentsRepository,
} from '@/domain/application/repositories/question-comments.repository'
import type { QuestionComment } from '@/domain/enterprise/entities/question-comment.entity'
import { InMemoryCommentsRepository } from './in-memory-comments.repository'

export class InMemoryQuestionCommentsRepository
  extends InMemoryCommentsRepository<QuestionComment>
  implements QuestionCommentsRepository {
  async findManyByQuestionId (questionId: string, params: PaginationParams): Promise<PaginatedQuestionComments> {
    const comments = await this.findManyItemsBy({
      where: { questionId },
      params: {
        page: params.page,
        pageSize: params.pageSize,
        order: params.order,
      },
    })
    return comments
  }
}
