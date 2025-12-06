import type { Attachment } from '@prisma/client'
import type { QuestionAttachment } from '@/domain/enterprise/entities/question-attachment.entity'

export class PrismaQuestionAttachmentMapper {
  static toDomain (raw: Attachment): QuestionAttachment {
    if (!raw.questionId) {
      throw new Error('Attachment is not a question attachment')
    }
    const attachment: QuestionAttachment = {
      id: raw.id,
      title: raw.title,
      url: raw.link,
      questionId: raw.questionId,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt || raw.createdAt,
    }
    return attachment
  }
}
