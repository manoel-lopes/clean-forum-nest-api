import type { AnswerWithRelations } from '@/domain/application/repositories/answers.repository'
import type { AnswerAttachment } from '@/domain/enterprise/entities/answer-attachment.entity'
import type { AnswerComment } from '@/domain/enterprise/entities/answer-comment.entity'
import type { User } from '@/domain/enterprise/entities/user.entity'
import type { Answer, Attachment, Comment } from '@prisma/client'

type PrismaAnswerWithOptionalIncludes = Answer & {
  comments?: Comment[] | false
  attachments?: Attachment[] | false
  author?: Pick<User, 'id' | 'name' | 'email' | 'createdAt' | 'updatedAt'> | false
}

export class PrismaAnswerMapper {
  static toDomain (raw: PrismaAnswerWithOptionalIncludes): AnswerWithRelations {
    const { comments, attachments, author, ...answerData } = raw
    const response: AnswerWithRelations = {
      ...answerData,
      updatedAt: answerData.updatedAt || answerData.createdAt,
    }
    if (Array.isArray(comments)) {
      response.comments = comments.map((comment): AnswerComment => ({
        id: comment.id,
        content: comment.content,
        authorId: comment.authorId,
        answerId: comment.answerId!,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt || comment.createdAt,
      }))
    }
    if (Array.isArray(attachments)) {
      response.attachments = attachments.map((attachment): AnswerAttachment => ({
        id: attachment.id,
        title: attachment.title,
        url: attachment.link,
        answerId: attachment.answerId!,
        createdAt: attachment.createdAt,
        updatedAt: attachment.updatedAt || attachment.createdAt,
      }))
    }
    if (author && typeof author === 'object') {
      response.author = {
        id: author.id,
        name: author.name,
        email: author.email,
        createdAt: author.createdAt,
        updatedAt: author.updatedAt,
      }
    }
    return response
  }
}
