import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import type { PaginationParams } from '@/core/domain/pagination-params'
import type { UpdateAttachmentData } from '@/domain/application/repositories/base/attachments.repository'
import type {
  PaginatedQuestionAttachments,
  QuestionAttachmentsRepository,
} from '@/domain/application/repositories/question-attachments.repository'
import { QuestionAttachment } from '@/domain/enterprise/entities/question-attachment/question-attachment.entity'
import { BaseTypeOrmRepository } from './base/base-typeorm.repository'

@Injectable()
export class TypeOrmQuestionAttachmentsRepository
  extends BaseTypeOrmRepository<QuestionAttachment>
  implements QuestionAttachmentsRepository {
  constructor (@InjectRepository(QuestionAttachment) repository: Repository<QuestionAttachment>) {
    super(repository)
  }

  async saveMany (attachments: QuestionAttachment[]): Promise<void> {
    await this.createMany(attachments)
  }

  async findManyByQuestionId (
    questionId: string,
    { page = 1, pageSize = 10, order = 'desc' }: PaginationParams
  ): Promise<PaginatedQuestionAttachments> {
    const pagination = this.formatPagination(page, pageSize)
    const [items, totalItems] = await this.findAndCount({
      where: { questionId },
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

  async update (attachmentId: string, data: UpdateAttachmentData): Promise<QuestionAttachment> {
    const updated = await this.updateOne({ id: attachmentId, ...data })
    return updated
  }
}
