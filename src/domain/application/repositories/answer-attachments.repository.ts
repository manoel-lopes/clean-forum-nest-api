import type { PaginatedItems } from '@/core/domain/application/paginated-items'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type { UpdateAttachmentData } from '@/domain/application/repositories/base/attachments.repository'
import type { Attachment } from '@/domain/enterprise/entities/base/attachment.entity'

export type PaginatedAnswerAttachments = Required<PaginatedItems<Attachment>>

export type AnswerAttachmentsRepository = {
  save(attachment: Attachment): Promise<void>
  saveMany(attachments: Attachment[]): Promise<void>
  findById(attachmentId: string): Promise<Attachment | null>
  findManyByAnswerId(answerId: string, params: PaginationParams): Promise<PaginatedAnswerAttachments>
  update(attachmentId: string, data: UpdateAttachmentData): Promise<Attachment>
  delete(attachmentId: string): Promise<void>
  deleteMany(attachmentIds: string[]): Promise<void>
}

export const AnswerAttachmentsRepository = Symbol('AnswerAttachmentsRepository')
