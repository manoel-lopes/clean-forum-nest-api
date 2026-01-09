import type { PaginatedItems } from '@/core/domain/application/paginated-items'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type { AnswerAttachment, AnswerAttachmentProps } from '@/domain/enterprise/entities/answer-attachment.entity'

export type PaginatedAnswerAttachments = Required<PaginatedItems<AnswerAttachment>>

export type UpdateAnswerAttachmentData = {
  attachmentId: string
  data: Partial<Pick<AnswerAttachment, 'title' | 'url'>>
}

export type AnswerAttachmentsRepository = {
  create(attachment: AnswerAttachmentProps): Promise<AnswerAttachment>
  createMany(attachments: AnswerAttachmentProps[]): Promise<AnswerAttachment[]>
  findById(attachmentId: string): Promise<AnswerAttachment | null>
  findManyByAnswerId(answerId: string, params: PaginationParams): Promise<PaginatedAnswerAttachments>
  update(attachmentData: UpdateAnswerAttachmentData): Promise<AnswerAttachment>
  delete(attachmentId: string): Promise<void>
  deleteMany(attachmentIds: string[]): Promise<void>
}

export const AnswerAttachmentsRepository = Symbol('AnswerAttachmentsRepository')
