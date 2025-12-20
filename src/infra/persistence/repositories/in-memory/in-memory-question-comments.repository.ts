import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type {
  PaginatedQuestionComments,
  QuestionCommentsRepository,
} from '@/domain/application/repositories/question-comments.repository'
import type { Comment } from '@/domain/enterprise/entities/base/comment.entity'
import { InMemoryCommentsRepository } from './in-memory-comments.repository'

export class InMemoryQuestionCommentsRepository
  extends InMemoryCommentsRepository
  implements QuestionCommentsRepository {
  async findManyByQuestionId (questionId: string, params: PaginationParams): Promise<PaginatedQuestionComments> {
    return this.findManyItemsBy({
      where: { questionId },
      params: {
        page: params.page,
        pageSize: params.pageSize,
        order: params.order,
      },
    })
  }

  override async findById (commentId: string): Promise<Comment | null> {
    const comment = await super.findById(commentId)
    if (!comment || !comment.questionId) return null
    return comment
  }
}
