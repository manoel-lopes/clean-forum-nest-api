import type { PaginatedItems } from '@/core/domain/application/paginated-items'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type {
  QuestionAttachment,
  QuestionAttachmentProps,
} from '@/domain/enterprise/entities/question-attachment.entity'

export type PaginatedQuestionAttachments = Required<PaginatedItems<QuestionAttachment>>

export type QuestionAttachmentsRepository = {
  create(attachment: QuestionAttachmentProps): Promise<QuestionAttachment>
  createMany(attachments: QuestionAttachmentProps[]): Promise<QuestionAttachment[]>
  findById(attachmentId: string): Promise<QuestionAttachment | null>
  findManyByQuestionId(questionId: string, params: PaginationParams): Promise<PaginatedQuestionAttachments>
  update(attachmentId: string, data: Partial<Pick<QuestionAttachment, 'title' | 'url'>>): Promise<QuestionAttachment>
  delete(attachmentId: string): Promise<void>
  deleteMany(attachmentIds: string[]): Promise<void>
}
