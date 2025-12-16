import { Injectable } from '@nestjs/common'
import { eq, desc, asc, count } from 'drizzle-orm'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type {
  AnswerCommentsRepository,
  PaginatedAnswerComments,
} from '@/domain/application/repositories/answer-comments.repository'
import type { UpdateCommentData } from '@/domain/application/repositories/base/comments.repository'
import type { AnswerComment, AnswerCommentProps } from '@/domain/enterprise/entities/answer-comment.entity'
import { DrizzleService } from '@/infra/persistence/drizzle/drizzle.service'
import { comments } from '@/infra/persistence/drizzle/schema'
import { BaseDrizzleRepository } from './base/base-drizzle.repository'

@Injectable()
export class DrizzleAnswerCommentsRepository extends BaseDrizzleRepository implements AnswerCommentsRepository {
  constructor (private readonly drizzle: DrizzleService) {
    super()
  }

  async create (data: AnswerCommentProps): Promise<AnswerComment> {
    const [comment] = await this.drizzle.db
      .insert(comments)
      .values({ ...data, questionId: null })
      .returning()
    return {
      ...comment,
      answerId: comment.answerId!,
      updatedAt: comment.updatedAt ?? comment.createdAt,
    }
  }

  async findById (commentId: string): Promise<AnswerComment | null> {
    const [comment] = await this.drizzle.db
      .select()
      .from(comments)
      .where(eq(comments.id, commentId))
      .limit(1)
    if (!comment || !comment.answerId) return null
    return {
      ...comment,
      answerId: comment.answerId,
      updatedAt: comment.updatedAt ?? comment.createdAt,
    }
  }

  async findManyByAnswerId (
    answerId: string,
    { page = 1, pageSize = 10, order = 'desc' }: PaginationParams
  ): Promise<PaginatedAnswerComments> {
    const pagination = this.sanitizePagination(page, pageSize)
    const orderFn = order === 'desc' ? desc : asc
    const [commentsList, [countResult]] = await Promise.all([
      this.drizzle.db
        .select()
        .from(comments)
        .where(eq(comments.answerId, answerId))
        .orderBy(orderFn(comments.createdAt))
        .offset(pagination.offset)
        .limit(pagination.limit),
      this.drizzle.db
        .select({ count: count() })
        .from(comments)
        .where(eq(comments.answerId, answerId)),
    ])
    const totalItems = countResult.count
    return {
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pagination.pageSize),
      order,
      items: commentsList.map(c => ({
        ...c,
        answerId: c.answerId!,
        updatedAt: c.updatedAt ?? c.createdAt,
      })),
    }
  }

  async update ({ where, data }: UpdateCommentData): Promise<AnswerComment> {
    const [updatedComment] = await this.drizzle.db
      .update(comments)
      .set(data)
      .where(eq(comments.id, where.id))
      .returning()
    return {
      ...updatedComment,
      answerId: updatedComment.answerId!,
      updatedAt: updatedComment.updatedAt ?? updatedComment.createdAt,
    }
  }

  async delete (commentId: string): Promise<void> {
    await this.drizzle.db.delete(comments).where(eq(comments.id, commentId))
  }
}
