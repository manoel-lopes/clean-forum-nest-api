import type { Answer, Attachment, Comment, User } from '@prisma/client'
import { AnswerWithRelations } from '@/domain/application/repositories/answers.repository'
import { PrismaAnswerAttachmentMapper } from './prisma-answer-attachment.mapper'
import { PrismaUserMapper } from './prisma-user.mapper'

interface PrismaAnswerWithIncludes extends Answer {
  comments?: Comment[]
  attachments?: Attachment[]
  author?: User
}

export class PrismaAnswerMapper {
  static toDomain (raw: PrismaAnswerWithIncludes) {
    const { attachments, author, ...answerData } = raw
    const result: AnswerWithRelations = { ...answerData }
    if (attachments) result.attachments = attachments.map(PrismaAnswerAttachmentMapper.toDomain)
    if (author) result.author = PrismaUserMapper.toDomain(author)
    return result
  }
}
