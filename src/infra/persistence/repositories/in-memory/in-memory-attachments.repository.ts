import type { Attachment } from '@/domain/enterprise/entities/base/attachment.entity'
import { BaseInMemoryRepository as BaseRepository } from './base/base-in-memory.repository'

export class InMemoryAttachmentsRepository<T extends Attachment = Attachment> extends BaseRepository<T> {
  async createMany (attachments: T[]): Promise<T[]> {
    const createdAttachments: T[] = []
    for (const attachment of attachments) {
      const created = await this.create(attachment)
      createdAttachments.push(created)
    }
    return createdAttachments
  }

  async update (attachmentId: string, data: Partial<Pick<T, 'title' | 'url'>>): Promise<T> {
    const updatedAttachment = await this.updateOne({
      where: { id: attachmentId },
      data,
    })
    return updatedAttachment
  }

  async deleteMany (attachmentIds: string[]) {
    this.items = this.items.filter((item) => !attachmentIds.includes(item.id))
  }
}
