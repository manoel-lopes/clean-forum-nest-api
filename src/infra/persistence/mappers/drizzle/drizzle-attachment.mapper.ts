import type { attachments } from '@/infra/persistence/drizzle/schema'
import type { AnswerAttachment } from '@/domain/enterprise/entities/answer-attachment.entity'
import type { QuestionAttachment } from '@/domain/enterprise/entities/question-attachment.entity'

type DrizzleAttachment = typeof attachments.$inferSelect

export class DrizzleAttachmentMapper {
  static toAnswerAttachment (raw: DrizzleAttachment): AnswerAttachment {
    return {
      id: raw.id,
      title: raw.title,
      url: raw.link,
      answerId: raw.answerId!,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt ?? raw.createdAt,
    }
  }

  static toQuestionAttachment (raw: DrizzleAttachment): QuestionAttachment {
    return {
      id: raw.id,
      title: raw.title,
      url: raw.link,
      questionId: raw.questionId!,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt ?? raw.createdAt,
    }
  }
}
