import type { PaginatedItems } from '@/core/domain/application/paginated-items'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type { UpdateAttachmentData } from '@/domain/application/repositories/base/attachments.repository'
import type { QuestionAttachment } from '@/domain/enterprise/entities/question-attachment.entity'

export type PaginatedQuestionAttachments = Required<PaginatedItems<QuestionAttachment>>

export type QuestionAttachmentsRepository = {
  save(attachment: QuestionAttachment): Promise<void>
  saveMany(attachments: QuestionAttachment[]): Promise<void>
  findById(attachmentId: string): Promise<QuestionAttachment | null>
  findManyByQuestionId(questionId: string, params: PaginationParams): Promise<PaginatedQuestionAttachments>
  update(attachmentId: string, data: UpdateAttachmentData): Promise<QuestionAttachment>
  delete(attachmentId: string): Promise<void>
  deleteMany(attachmentIds: string[]): Promise<void>
}

export const QuestionAttachmentsRepository = Symbol('QuestionAttachmentsRepository')
