import type { AnswerAttachment } from '@/domain/enterprise/entities/answer-attachment.entity'
import type { Attachment } from '@prisma/client'

export class PrismaAnswerAttachmentMapper {
  static toDomain (raw: Attachment): AnswerAttachment {
    if (!raw.answerId) {
      throw new Error('Attachment is not an answer attachment')
    }
    const attachment: AnswerAttachment = {
      id: raw.id,
      title: raw.title,
      url: raw.link,
      answerId: raw.answerId,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt || raw.createdAt,
    }
    return attachment
  }
}
