import type { PaginatedItems } from '@/core/domain/application/paginated-items'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type { UpdateAttachmentData } from '@/domain/application/repositories/base/attachments.repository'
import type { Attachment } from '@/domain/enterprise/entities/base/attachment.entity'

export type PaginatedQuestionAttachments = Required<PaginatedItems<Attachment>>

export type QuestionAttachmentsRepository = {
  save(attachment: Attachment): Promise<void>
  saveMany(attachments: Attachment[]): Promise<void>
  findById(attachmentId: string): Promise<Attachment | null>
  findManyByQuestionId(questionId: string, params: PaginationParams): Promise<PaginatedQuestionAttachments>
  update(attachmentId: string, data: UpdateAttachmentData): Promise<Attachment>
  delete(attachmentId: string): Promise<void>
  deleteMany(attachmentIds: string[]): Promise<void>
}

export const QuestionAttachmentsRepository = Symbol('QuestionAttachmentsRepository')
