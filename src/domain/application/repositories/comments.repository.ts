import type { PaginatedItems } from '@/core/domain/application/paginated-items'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type { Comment, CommentProps } from '@/domain/enterprise/entities/comment.entity'

export type PaginatedComments = Required<PaginatedItems<Comment>>

export type UpdateCommentData = {
  commentId: string
  data: Partial<Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>>
}

export type CommentsRepository = {
  create(comment: CommentProps): Promise<Comment>
  findById(commentId: string): Promise<Comment | null>
  findManyByAnswerId(answerId: string, params: PaginationParams): Promise<PaginatedComments>
  delete(commentId: string): Promise<void>
  update(commentData: UpdateCommentData): Promise<Comment>
}

export const CommentsRepository = Symbol('CommentsRepository')
