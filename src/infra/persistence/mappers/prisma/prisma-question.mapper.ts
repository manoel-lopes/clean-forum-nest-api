import type { Attachment, Question, User } from '@prisma/client'
import { QuestionWithRelations } from '@/domain/application/repositories/questions.repository'
import { PrismaQuestionAttachmentMapper } from './prisma-question-attachment.mapper'
import { PrismaUserMapper } from './prisma-user.mapper'

interface PrismaQuestionWithIncludes extends Question {
  attachments?: Attachment[]
  author?: User
}

export class PrismaQuestionMapper {
  static toDomain (raw: PrismaQuestionWithIncludes) {
    const { attachments, author, ...answerData } = raw
    const result: QuestionWithRelations = { ...answerData }
    if (attachments) result.attachments = attachments.map(PrismaQuestionAttachmentMapper.toDomain)
    if (author) result.author = PrismaUserMapper.toDomain(author)
    return result
  }
}
