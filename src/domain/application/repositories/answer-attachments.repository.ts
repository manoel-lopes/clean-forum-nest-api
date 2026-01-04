import type { PaginatedItems } from '@/core/domain/paginated-items'
import type { PaginationParams } from '@/core/domain/pagination-params'
import type { UpdateAttachmentData } from '@/domain/application/repositories/base/attachments.repository'
import type { AnswerAttachment } from '@/domain/enterprise/entities/answer-attachment/answer-attachment.entity'

export type PaginatedAnswerAttachments = Required<PaginatedItems<AnswerAttachment>>

export type AnswerAttachmentsRepository = {
  save(attachment: AnswerAttachment): Promise<void>
  saveMany(attachments: AnswerAttachment[]): Promise<void>
  findById(attachmentId: string): Promise<AnswerAttachment | null>
  findManyByAnswerId(answerId: string, params: PaginationParams): Promise<PaginatedAnswerAttachments>
  update(attachmentId: string, data: UpdateAttachmentData): Promise<AnswerAttachment>
  delete(attachmentId: string | string[]): Promise<void>
}

export const AnswerAttachmentsRepository = Symbol('AnswerAttachmentsRepository')
