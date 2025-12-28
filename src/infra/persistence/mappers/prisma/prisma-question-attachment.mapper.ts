import type { Attachment } from '@prisma/client'
import type { QuestionAttachment } from '@/domain/enterprise/entities/question-attachment.entity'

export class PrismaQuestionAttachmentMapper {
  static toDomain (raw: Attachment): QuestionAttachment {
    if (!raw.questionId) {
      throw new Error('Attachment is not a question attachment')
    }
    return {
      id: raw.id,
      title: raw.title,
      url: raw.url,
      questionId: raw.questionId,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    }
  }
}
