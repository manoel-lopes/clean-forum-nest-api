import type { PaginatedItems } from '@/core/domain/application/paginated-items'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type { AnswerComment, AnswerCommentProps } from '@/domain/enterprise/entities/answer-comment.entity'
import type { CommentsRepository } from './base/comments.repository'

export type PaginatedAnswerComments = Required<PaginatedItems<AnswerComment>>

export type AnswerCommentsRepository = CommentsRepository<AnswerComment> & {
  create(comment: AnswerCommentProps): Promise<AnswerComment>
  findManyByAnswerId(answerId: string, params: PaginationParams): Promise<PaginatedAnswerComments>
}
