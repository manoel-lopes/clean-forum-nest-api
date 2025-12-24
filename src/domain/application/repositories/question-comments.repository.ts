import type { PaginatedItems } from '@/core/domain/paginated-items'
import type { PaginationParams } from '@/core/domain/pagination-params'
import type { Comment } from '@/domain/enterprise/entities/base/comment.entity'
import type { CommentsRepository } from './base/comments.repository'

export type PaginatedQuestionComments = Required<PaginatedItems<Comment>>

export type QuestionCommentsRepository = CommentsRepository<Comment> & {
  save(comment: Comment): Promise<void>
  findManyByQuestionId(questionId: string, params: PaginationParams): Promise<PaginatedQuestionComments>
}

export const QuestionCommentsRepository = Symbol('QuestionCommentsRepository')
