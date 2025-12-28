import type { Answer, Attachment, Comment, User } from '@prisma/client'
import type { AnswerWithRelations } from '@/domain/application/repositories/answers.repository'
import { PrismaAnswerAttachmentMapper } from './prisma-answer-attachment.mapper'
import { PrismaAnswerCommentMapper } from './prisma-answer-comment.mapper'

type PrismaAnswerWithOptionalIncludes = Answer & {
  comments?: Comment[]
  attachments?: Attachment[]
  author?: User
}

export class PrismaAnswerMapper {
  static toDomain (raw: PrismaAnswerWithOptionalIncludes): AnswerWithRelations {
    const { comments, attachments, author, ...answerData } = raw
    const result: AnswerWithRelations = { ...answerData }
    if (comments) {
      result.comments = comments.map(PrismaAnswerCommentMapper.toDomain)
    }
    if (attachments) {
      result.attachments = attachments.map(PrismaAnswerAttachmentMapper.toDomain)
    }
    if (author) {
      const { password: _, ...authorWithoutPassword } = author
      result.author = authorWithoutPassword
    }
    return result
  }
}
