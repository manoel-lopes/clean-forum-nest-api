import type { PaginatedItems } from '@/core/domain/application/paginated-items'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type { QuestionComment, QuestionCommentProps } from '@/domain/enterprise/entities/question-comment.entity'
import type { CommentsRepository } from './base/comments.repository'

export type PaginatedQuestionComments = Required<PaginatedItems<QuestionComment>>

export type QuestionCommentsRepository = CommentsRepository<QuestionComment> & {
  create(comment: QuestionCommentProps): Promise<QuestionComment>
  findManyByQuestionId(questionId: string, params: PaginationParams): Promise<PaginatedQuestionComments>
}
