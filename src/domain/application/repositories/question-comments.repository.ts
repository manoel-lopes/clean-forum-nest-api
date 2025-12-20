import type { PaginatedItems } from '@/core/domain/application/paginated-items'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type { Comment } from '@/domain/enterprise/entities/base/comment.entity'
import type { CommentsRepository } from './base/comments.repository'

export type PaginatedQuestionComments = Required<PaginatedItems<Comment>>

export type QuestionCommentsRepository = CommentsRepository<Comment> & {
  save(comment: Comment): Promise<void>
  findManyByQuestionId(questionId: string, params: PaginationParams): Promise<PaginatedQuestionComments>
}

export const QuestionCommentsRepository = Symbol('QuestionCommentsRepository')
