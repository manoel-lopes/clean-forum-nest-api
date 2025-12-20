import { AnswerAttachment } from '@/domain/enterprise/entities/answer-attachment.entity'
import { Attachment } from '@/domain/enterprise/entities/base/attachment.entity'
import { QuestionAttachment } from '@/domain/enterprise/entities/question-attachment.entity'

export class TypeOrmAttachmentMapper {
  static toDomain (raw: Attachment): Attachment {
    if (raw.answerId) {
      return AnswerAttachment.create({
        title: raw.title,
        url: raw.url,
        answerId: raw.answerId,
      }, raw.id)
    }
    return QuestionAttachment.create({
      title: raw.title,
      url: raw.url,
      questionId: raw.questionId,
    }, raw.id)
  }
}
