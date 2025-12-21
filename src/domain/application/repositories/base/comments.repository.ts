import type { Comment } from '@/domain/enterprise/entities/base/comment.entity'

export type UpdateCommentData = {
  commentId: string
  data: Partial<Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>>
}

export type CommentsRepository<T = Comment> = {
  findById(commentId: string): Promise<T | null>
  delete(commentId: string): Promise<void>
  update(commentData: UpdateCommentData): Promise<T>
}

export const CommentsRepository = Symbol('CommentsRepository')
