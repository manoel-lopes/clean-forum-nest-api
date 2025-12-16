import { asc, count, desc, eq, inArray } from 'drizzle-orm'
import { Injectable } from '@nestjs/common'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type {
  PaginatedQuestionAttachments,
  QuestionAttachmentsRepository,
} from '@/domain/application/repositories/question-attachments.repository'
import { DrizzleService } from '@/infra/persistence/drizzle/drizzle.service'
import { attachments } from '@/infra/persistence/drizzle/schema'
import type { QuestionAttachment, QuestionAttachmentProps } from '@/domain/enterprise/entities/question-attachment.entity'
import { BaseDrizzleRepository } from './base/base-drizzle.repository'

@Injectable()
export class DrizzleQuestionAttachmentsRepository extends BaseDrizzleRepository implements QuestionAttachmentsRepository {
  constructor (private readonly drizzle: DrizzleService) {
    super()
  }

  async create (data: QuestionAttachmentProps): Promise<QuestionAttachment> {
    const [attachment] = await this.drizzle.db
      .insert(attachments)
      .values({ ...data, link: data.url, answerId: null })
      .returning()
    return {
      id: attachment.id,
      title: attachment.title,
      url: attachment.link,
      questionId: attachment.questionId!,
      createdAt: attachment.createdAt,
      updatedAt: attachment.updatedAt ?? attachment.createdAt,
    }
  }

  async createMany (data: QuestionAttachmentProps[]): Promise<QuestionAttachment[]> {
    if (data.length === 0) return []
    const inserted = await this.drizzle.db
      .insert(attachments)
      .values(data.map(d => ({ ...d, link: d.url, answerId: null })))
      .returning()
    return inserted.map(attachment => ({
      id: attachment.id,
      title: attachment.title,
      url: attachment.link,
      questionId: attachment.questionId!,
      createdAt: attachment.createdAt,
      updatedAt: attachment.updatedAt ?? attachment.createdAt,
    }))
  }

  async findById (attachmentId: string): Promise<QuestionAttachment | null> {
    const [attachment] = await this.drizzle.db
      .select()
      .from(attachments)
      .where(eq(attachments.id, attachmentId))
      .limit(1)
    if (!attachment || !attachment.questionId) return null
    return {
      id: attachment.id,
      title: attachment.title,
      url: attachment.link,
      questionId: attachment.questionId,
      createdAt: attachment.createdAt,
      updatedAt: attachment.updatedAt ?? attachment.createdAt,
    }
  }

  async findManyByQuestionId (
    questionId: string,
    { page = 1, pageSize = 10, order = 'desc' }: PaginationParams
  ): Promise<PaginatedQuestionAttachments> {
    const pagination = this.sanitizePagination(page, pageSize)
    const orderFn = order === 'desc' ? desc : asc
    const [attachmentsList, [countResult]] = await Promise.all([
      this.drizzle.db
        .select()
        .from(attachments)
        .where(eq(attachments.questionId, questionId))
        .orderBy(orderFn(attachments.createdAt))
        .offset(pagination.offset)
        .limit(pagination.limit),
      this.drizzle.db
        .select({ count: count() })
        .from(attachments)
        .where(eq(attachments.questionId, questionId)),
    ])
    const totalItems = countResult.count
    return {
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pagination.pageSize),
      order,
      items: attachmentsList.map(attachment => ({
        id: attachment.id,
        title: attachment.title,
        url: attachment.link,
        questionId: attachment.questionId!,
        createdAt: attachment.createdAt,
        updatedAt: attachment.updatedAt ?? attachment.createdAt,
      })),
    }
  }

  async update (attachmentId: string, data: Partial<Pick<QuestionAttachment, 'title' | 'url'>>): Promise<QuestionAttachment> {
    const updateData: Partial<typeof attachments.$inferInsert> = {}
    if (data.title) updateData.title = data.title
    if (data.url) updateData.link = data.url
    const [updatedAttachment] = await this.drizzle.db
      .update(attachments)
      .set(updateData)
      .where(eq(attachments.id, attachmentId))
      .returning()
    return {
      id: updatedAttachment.id,
      title: updatedAttachment.title,
      url: updatedAttachment.link,
      questionId: updatedAttachment.questionId!,
      createdAt: updatedAttachment.createdAt,
      updatedAt: updatedAttachment.updatedAt ?? updatedAttachment.createdAt,
    }
  }

  async delete (attachmentId: string): Promise<void> {
    await this.drizzle.db.delete(attachments).where(eq(attachments.id, attachmentId))
  }

  async deleteMany (attachmentIds: string[]): Promise<void> {
    if (attachmentIds.length === 0) return
    await this.drizzle.db.delete(attachments).where(inArray(attachments.id, attachmentIds))
  }
}
