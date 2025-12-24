import type { Attachment } from '@/domain/enterprise/entities/base/attachment.entity'

export type UpdateAttachmentData = Partial<Pick<Attachment, 'title' | 'url'>>

export type AttachmentsRepository<T = Attachment> = {
  findById(attachmentId: string): Promise<T | null>
  delete(attachmentId: string): Promise<void>
  update(attachmentId: string, data: UpdateAttachmentData): Promise<T>
}

export const AttachmentsRepository = Symbol('AttachmentsRepository')
