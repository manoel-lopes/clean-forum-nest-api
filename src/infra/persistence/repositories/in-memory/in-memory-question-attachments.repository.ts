import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type {
  PaginatedQuestionAttachments,
  QuestionAttachmentsRepository,
} from '@/domain/application/repositories/question-attachments.repository'
import type { Attachment } from '@/domain/enterprise/entities/base/attachment.entity'
import { InMemoryAttachmentsRepository } from './in-memory-attachments.repository'

export class InMemoryQuestionAttachmentsRepository
  extends InMemoryAttachmentsRepository
  implements QuestionAttachmentsRepository {
  async findManyByQuestionId (questionId: string, params: PaginationParams): Promise<PaginatedQuestionAttachments> {
    return this.findManyItemsBy({
      where: { questionId },
      params: {
        page: params.page,
        pageSize: params.pageSize,
        order: params.order,
      },
    })
  }

  override async findById (attachmentId: string): Promise<Attachment | null> {
    const attachment = await super.findById(attachmentId)
    if (!attachment || !attachment.questionId) return null
    return attachment
  }
}
