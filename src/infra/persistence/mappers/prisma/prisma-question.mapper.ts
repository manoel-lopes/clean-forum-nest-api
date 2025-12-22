import type { Answer, Attachment, Comment, User } from '@prisma/client'
import type { QuestionWithRelations } from '@/domain/application/repositories/questions.repository'
import type { Question } from '@/domain/enterprise/entities/question.entity'
import { PrismaQuestionAttachmentMapper } from './prisma-question-attachment.mapper'
import { PrismaQuestionCommentMapper } from './prisma-question-comment.mapper'
import { PrismaUserMapper } from './prisma-user.mapper'

type AnswerWithIncludes = Answer & {
  author?: User
  comments?: Comment[]
  attachments?: Attachment[]
}

type QuestionWithOptionalIncludes = Question & {
  answers?: AnswerWithIncludes[]
  comments?: Comment[]
  attachments?: Attachment[]
  author?: User
}

export class PrismaQuestionMapper {
  static toDomain (raw: QuestionWithOptionalIncludes): QuestionWithRelations {
    const { answers: _, comments, attachments, author, ...questionData } = raw
    const result: QuestionWithRelations = { ...questionData }
    if (comments) {
      result.comments = comments.map(PrismaQuestionCommentMapper.toDomain)
    }
    if (attachments) {
      result.attachments = attachments.map(PrismaQuestionAttachmentMapper.toDomain)
    }
    if (author) {
      result.author = PrismaUserMapper.toDomain(author)
    }
    return result
  }
}
