import type { Attachment } from '@prisma/client'
import type { AnswerAttachment } from '@/domain/enterprise/entities/answer-attachment.entity'

export class PrismaAnswerAttachmentMapper {
  static toDomain (raw: Attachment): AnswerAttachment {
    if (!raw.answerId) {
      throw new Error('Attachment is not an answer attachment')
    }
    return {
      id: raw.id,
      title: raw.title,
      url: raw.url,
      answerId: raw.answerId,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    }
  }
}
