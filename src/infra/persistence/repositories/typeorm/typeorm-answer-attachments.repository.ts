import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import type { PaginationParams } from '@/core/domain/pagination-params'
import type {
  AnswerAttachmentsRepository,
  PaginatedAnswerAttachments,
} from '@/domain/application/repositories/answer-attachments.repository'
import type { UpdateAttachmentData } from '@/domain/application/repositories/base/attachments.repository'
import { AnswerAttachment } from '@/domain/enterprise/entities/answer-attachment.entity'
import { BaseTypeOrmRepository } from './base/base-typeorm.repository'

@Injectable()
export class TypeOrmAnswerAttachmentsRepository
  extends BaseTypeOrmRepository<AnswerAttachment>
  implements AnswerAttachmentsRepository {
  constructor (@InjectRepository(AnswerAttachment) repository: Repository<AnswerAttachment>) {
    super(repository)
  }

  async saveMany (attachments: AnswerAttachment[]): Promise<void> {
    await this.createMany(attachments)
  }

  async findManyByAnswerId (
    answerId: string,
    { page = 1, pageSize = 10, order = 'desc' }: PaginationParams
  ): Promise<PaginatedAnswerAttachments> {
    const pagination = this.formatPagination(page, pageSize)
    const [items, totalItems] = await this.findAndCount({
      where: { answerId },
      order: { createdAt: order },
      skip: pagination.offset,
      take: pagination.limit,
    })
    return {
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pagination.pageSize),
      order,
      items,
    }
  }

  async update (attachmentId: string, data: UpdateAttachmentData): Promise<AnswerAttachment> {
    const updated = await this.updateOne({ id: attachmentId, ...data })
    return updated
  }
}
