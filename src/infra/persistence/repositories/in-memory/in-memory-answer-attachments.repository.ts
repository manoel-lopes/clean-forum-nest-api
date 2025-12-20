import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type {
  AnswerAttachmentsRepository,
  PaginatedAnswerAttachments,
} from '@/domain/application/repositories/answer-attachments.repository'
import type { Attachment } from '@/domain/enterprise/entities/base/attachment.entity'
import { InMemoryAttachmentsRepository } from './in-memory-attachments.repository'

export class InMemoryAnswerAttachmentsRepository
  extends InMemoryAttachmentsRepository
  implements AnswerAttachmentsRepository {
  async findManyByAnswerId (answerId: string, params: PaginationParams): Promise<PaginatedAnswerAttachments> {
    return this.findManyItemsBy({
      where: { answerId },
      params: {
        page: params.page,
        pageSize: params.pageSize,
        order: params.order,
      },
    })
  }

  override async findById (attachmentId: string): Promise<Attachment | null> {
    const attachment = await super.findById(attachmentId)
    if (!attachment || !attachment.answerId) return null
    return attachment
  }
}
