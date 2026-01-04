import type { UpdateAttachmentData } from '@/domain/application/repositories/base/attachments.repository'
import { BaseAttachment } from '@/domain/enterprise/entities/base/attachment.entity'
import { BaseInMemoryRepository as BaseRepository } from './base/base-in-memory.repository'

export class InMemoryAttachmentsRepository<T extends BaseAttachment = BaseAttachment> extends BaseRepository<T> {
  async saveMany (attachments: T[]): Promise<void> {
    for (const attachment of attachments) {
      await this.save(attachment)
    }
  }

  async update (attachmentId: string, data: UpdateAttachmentData): Promise<T> {
    const updatedAttachment = await this.updateOne({ id: attachmentId, ...data })
    return updatedAttachment
  }
}
