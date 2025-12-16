import type { Answer, Attachment, Comment } from '@prisma/client'
import type { AnswerWithRelations } from '@/domain/application/repositories/answers.repository'
import type { User } from '@/domain/enterprise/entities/user.entity'
import { BasePrismaMapper } from './base/base-prisma.mapper'

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
      updatedAt: BasePrismaMapper.normalizeTimestamp(answerData.updatedAt, answerData.createdAt),
    }
    const mappedComments = BasePrismaMapper.mapAnswerComments(comments)
    if (mappedComments) {
      response.comments = mappedComments
    }
    const mappedAttachments = BasePrismaMapper.mapAnswerAttachments(attachments)
    if (mappedAttachments) {
      response.attachments = mappedAttachments
    }
    const mappedAuthor = BasePrismaMapper.mapAuthor(author ?? null)
    if (mappedAuthor) {
      response.author = mappedAuthor
    }
    return response
  }
}
