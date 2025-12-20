import { inArray } from 'drizzle-orm'
import { Injectable } from '@nestjs/common'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type {
  AnswerAttachmentsRepository,
  PaginatedAnswerAttachments,
} from '@/domain/application/repositories/answer-attachments.repository'
import { DrizzleService } from '@/infra/persistence/drizzle/drizzle.service'
import { attachments } from '@/infra/persistence/drizzle/schema'
import { AnswerAttachmentMapper } from '@/infra/persistence/mappers/drizzle/drizzle-answer-attachment.mapper'
import type { AnswerAttachment, AnswerAttachmentProps } from '@/domain/enterprise/entities/answer-attachment.entity'
import { BaseDrizzleRepository } from './base/base-drizzle.repository'

@Injectable()
export class DrizzleAnswerAttachmentsRepository
  extends BaseDrizzleRepository<typeof attachments, AnswerAttachment, AnswerAttachmentProps>
  implements AnswerAttachmentsRepository {
  constructor (readonly drizzle: DrizzleService) {
    super(drizzle, attachments)
  }

  async create (data: AnswerAttachmentProps) {
    const attachment = await this.save(data)
    return AnswerAttachmentMapper.toDomain(attachment)
  }

  async findById (id: string): Promise<AnswerAttachment | null> {
    const attachment = await this.findOne({ where: { id } })
    return attachment ? AnswerAttachmentMapper.toDomain(attachment) : null
  }

  async createMany (data: AnswerAttachmentProps[]): Promise<AnswerAttachment[]> {
    const attachments = await this.saveMany(data)
    return attachments.map(attachment => AnswerAttachmentMapper.toDomain(attachment))
  }

  async findManyByAnswerId (
    answerId: string,
    { page = 1, pageSize = 10, order = 'desc' }: PaginationParams
  ): Promise<PaginatedAnswerAttachments> {
    const attachments = await this.findManyBy({
      where: { answerId },
      params: { page, pageSize, order },
    })
    return {
      page,
      pageSize,
      totalItems: attachments.length,
      totalPages: Math.ceil(attachments.length / pageSize),
      order,
      items: attachments.map(attachment => AnswerAttachmentMapper.toDomain(attachment)),
    }
  }

  async update (
    attachmentId: string,
    data: Partial<Pick<AnswerAttachment, 'title' | 'url'>>
  ): Promise<AnswerAttachment> {
    const attachment = await this.updateOne({
      where: { id: attachmentId },
      data,
    })
    return AnswerAttachmentMapper.toDomain(attachment)
  }

  async deleteMany (attachmentIds: string[]): Promise<void> {
    await this.removeMany({ where: { id: inArray(attachments.id, attachmentIds) } })
  }
}
