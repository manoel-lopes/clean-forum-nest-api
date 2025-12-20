import { Attachment } from '@/domain/enterprise/entities/base/attachment.entity'
import { BaseInMemoryRepository as BaseRepository } from './base/base-in-memory.repository'

export class InMemoryAttachmentsRepository extends BaseRepository<Attachment> {
  async saveMany (attachments: Attachment[]): Promise<void> {
    for (const attachment of attachments) {
      await this.save(attachment)
    }
  }

  async update (attachmentId: string, data: Partial<Pick<Attachment, 'title' | 'url'>>): Promise<Attachment> {
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
