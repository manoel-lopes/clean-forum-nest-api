import type { PaginatedItems } from '@/core/domain/paginated-items'
import type { PaginationParams } from '@/core/domain/pagination-params'
import type { Comment } from '@/domain/enterprise/entities/base/comment.entity'
import type { CommentsRepository } from './base/comments.repository'

export type PaginatedAnswerComments = Required<PaginatedItems<Comment>>

export type AnswerCommentsRepository = CommentsRepository<Comment> & {
  save(comment: Comment): Promise<void>
  findManyByAnswerId(answerId: string, params: PaginationParams): Promise<PaginatedAnswerComments>
}

export const AnswerCommentsRepository = Symbol('AnswerCommentsRepository')
