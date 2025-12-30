import type { Answer, Attachment, Comment as PrismaComment, User } from '@prisma/client'
import type { AnswerWithRelations } from '@/domain/application/repositories/answers.repository'
import type { Comment } from '@/domain/enterprise/entities/comment.entity'
import { PrismaAnswerAttachmentMapper } from './prisma-answer-attachment.mapper'

type PrismaAnswerWithOptionalIncludes = Answer & {
  comments?: PrismaComment[]
  attachments?: Attachment[]
  author?: User
}

export class PrismaAnswerMapper {
  static toDomain (raw: PrismaAnswerWithOptionalIncludes): AnswerWithRelations {
    const { attachments, author, comments, ...answerData } = raw
    const result: AnswerWithRelations = { ...answerData }
    if (comments) {
      result.comments = comments
        .filter((c): c is PrismaComment & { answerId: string } => c.answerId !== null)
        .map((c): Comment => ({
          id: c.id,
          content: c.content,
          authorId: c.authorId,
          answerId: c.answerId,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
        }))
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
