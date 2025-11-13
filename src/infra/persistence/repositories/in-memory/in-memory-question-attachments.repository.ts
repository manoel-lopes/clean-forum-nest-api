import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type {
  PaginatedQuestionAttachments,
  QuestionAttachmentsRepository,
} from '@/domain/application/repositories/question-attachments.repository'
import type { QuestionAttachment } from '@/domain/enterprise/entities/question-attachment.entity'
import { InMemoryAttachmentsRepository } from './in-memory-attachments.repository'

export class InMemoryQuestionAttachmentsRepository
  extends InMemoryAttachmentsRepository<QuestionAttachment>
  implements QuestionAttachmentsRepository {
  async findManyByQuestionId (questionId: string, params: PaginationParams): Promise<PaginatedQuestionAttachments> {
    const attachments = await this.findManyItemsBy({
      where: { questionId },
      params: {
        page: params.page,
        pageSize: params.pageSize,
        order: params.order,
      },
    })
    return attachments
  }
}
