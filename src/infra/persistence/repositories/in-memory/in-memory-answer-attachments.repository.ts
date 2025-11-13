import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type {
  AnswerAttachmentsRepository,
  PaginatedAnswerAttachments,
} from '@/domain/application/repositories/answer-attachments.repository'
import type { AnswerAttachment } from '@/domain/enterprise/entities/answer-attachment.entity'
import { InMemoryAttachmentsRepository } from './in-memory-attachments.repository'

export class InMemoryAnswerAttachmentsRepository
  extends InMemoryAttachmentsRepository<AnswerAttachment>
  implements AnswerAttachmentsRepository {
  async findManyByAnswerId (answerId: string, params: PaginationParams): Promise<PaginatedAnswerAttachments> {
    const attachments = await this.findManyItemsBy({
      where: { answerId },
      params: {
        page: params.page,
        pageSize: params.pageSize,
        order: params.order,
      },
    })
    return attachments
  }
}
