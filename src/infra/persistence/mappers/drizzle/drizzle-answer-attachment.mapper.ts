import type { attachments } from '@/infra/persistence/drizzle/schema'
import type { AnswerAttachment } from '@/domain/enterprise/entities/answer-attachment.entity'

type DrizzleAttachment = typeof attachments.$inferSelect

export class AnswerAttachmentMapper {
  static toDomain (raw: DrizzleAttachment): AnswerAttachment {
    if (!raw.answerId) throw new Error('Answer ID is required')
    return {
      id: raw.id,
      title: raw.title,
      url: raw.url,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      answerId: raw.answerId,
    }
  }
}
