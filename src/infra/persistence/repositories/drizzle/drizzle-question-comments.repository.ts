import { asc, count, desc, eq } from 'drizzle-orm'
import { Injectable } from '@nestjs/common'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type { UpdateCommentData } from '@/domain/application/repositories/base/comments.repository'
import type {
  PaginatedQuestionComments,
  QuestionCommentsRepository,
} from '@/domain/application/repositories/question-comments.repository'
import { DrizzleService } from '@/infra/persistence/drizzle/drizzle.service'
import { comments } from '@/infra/persistence/drizzle/schema'
import type { QuestionComment, QuestionCommentProps } from '@/domain/enterprise/entities/question-comment.entity'
import { BaseDrizzleRepository } from './base/base-drizzle.repository'

@Injectable()
export class DrizzleQuestionCommentsRepository extends BaseDrizzleRepository implements QuestionCommentsRepository {
  constructor (private readonly drizzle: DrizzleService) {
    super()
  }

  async create (data: QuestionCommentProps): Promise<QuestionComment> {
    const [comment] = await this.drizzle.db
      .insert(comments)
      .values({ ...data, answerId: null })
      .returning()
    return {
      ...comment,
      questionId: comment.questionId!,
      updatedAt: comment.updatedAt ?? comment.createdAt,
    }
  }

  async findById (commentId: string): Promise<QuestionComment | null> {
    const [comment] = await this.drizzle.db
      .select()
      .from(comments)
      .where(eq(comments.id, commentId))
      .limit(1)
    if (!comment || !comment.questionId) return null
    return {
      ...comment,
      questionId: comment.questionId,
      updatedAt: comment.updatedAt ?? comment.createdAt,
    }
  }

  async findManyByQuestionId (
    questionId: string,
    { page = 1, pageSize = 10, order = 'desc' }: PaginationParams
  ): Promise<PaginatedQuestionComments> {
    const pagination = this.sanitizePagination(page, pageSize)
    const orderFn = order === 'desc' ? desc : asc
    const [commentsList, [countResult]] = await Promise.all([
      this.drizzle.db
        .select()
        .from(comments)
        .where(eq(comments.questionId, questionId))
        .orderBy(orderFn(comments.createdAt))
        .offset(pagination.offset)
        .limit(pagination.limit),
      this.drizzle.db
        .select({ count: count() })
        .from(comments)
        .where(eq(comments.questionId, questionId)),
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
        questionId: c.questionId!,
        updatedAt: c.updatedAt ?? c.createdAt,
      })),
    }
  }

  async update ({ where, data }: UpdateCommentData): Promise<QuestionComment> {
    const [updatedComment] = await this.drizzle.db
      .update(comments)
      .set(data)
      .where(eq(comments.id, where.id))
      .returning()
    return {
      ...updatedComment,
      questionId: updatedComment.questionId!,
      updatedAt: updatedComment.updatedAt ?? updatedComment.createdAt,
    }
  }

  async delete (commentId: string): Promise<void> {
    await this.drizzle.db.delete(comments).where(eq(comments.id, commentId))
  }
}
