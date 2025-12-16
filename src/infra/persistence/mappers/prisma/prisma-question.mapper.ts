import type { Answer, Attachment, Comment, Question } from '@prisma/client'
import type { AnswerWithRelations } from '@/domain/application/repositories/answers.repository'
import type { QuestionWithRelations } from '@/domain/application/repositories/questions.repository'
import type { User } from '@/domain/enterprise/entities/user.entity'
import { BasePrismaMapper } from './base/base-prisma.mapper'

type PrismaAuthor = Pick<User, 'id' | 'name' | 'email' | 'createdAt' | 'updatedAt'>

type PrismaAnswer = Answer & {
  author?: PrismaAuthor
  comments?: Comment[] | false
  attachments?: Attachment[] | false
}

type PrismaQuestion = Question & {
  answers: PrismaAnswer[]
  comments?: Comment[] | false
  attachments?: Attachment[] | false
  author?: PrismaAuthor | false
}

type PaginationData = {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  order: 'asc' | 'desc'
}

type PrismaQuestionWithOptionalIncludes = Question & {
  comments?: Comment[] | false
  attachments?: Attachment[] | false
  author?: PrismaAuthor | false
}

export class PrismaQuestionMapper {
  static toQuestion (raw: PrismaQuestionWithOptionalIncludes): QuestionWithRelations {
    const { comments, attachments, author, ...questionData } = raw
    const response: QuestionWithRelations = {
      ...questionData,
      updatedAt: BasePrismaMapper.normalizeTimestamp(questionData.updatedAt, questionData.createdAt),
      answers: {
        page: 1,
        pageSize: 20,
        totalItems: 0,
        totalPages: 0,
        items: [],
        order: 'desc',
      },
    }
    PrismaQuestionMapper.applyRelations(response, { comments, attachments, author })
    return response
  }

  static toDomain (raw: PrismaQuestion, pagination?: PaginationData): QuestionWithRelations {
    const { answers, comments, attachments, author, ...questionData } = raw
    const mappedAnswers = answers.map(PrismaQuestionMapper.mapAnswer)
    const paginationData = pagination ?? {
      page: 1,
      pageSize: 20,
      totalItems: 0,
      totalPages: 0,
      order: 'desc' as const,
    }
    const response: QuestionWithRelations = {
      ...questionData,
      updatedAt: BasePrismaMapper.normalizeTimestamp(questionData.updatedAt, questionData.createdAt),
      answers: {
        page: paginationData.page,
        pageSize: paginationData.pageSize,
        totalItems: paginationData.totalItems,
        totalPages: paginationData.totalPages,
        items: mappedAnswers,
        order: paginationData.order,
      },
    }
    PrismaQuestionMapper.applyRelations(response, { comments, attachments, author })
    return response
  }

  private static mapAnswer (answer: PrismaAnswer): AnswerWithRelations {
    const { comments, attachments, author, ...answerData } = answer
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

  private static applyRelations (
    response: QuestionWithRelations,
    relations: {
      comments?: Comment[] | false
      attachments?: Attachment[] | false
      author?: PrismaAuthor | false
    }
  ): void {
    const { comments, attachments, author } = relations
    const mappedComments = BasePrismaMapper.mapQuestionComments(comments)
    if (mappedComments) {
      response.comments = mappedComments
    }
    const mappedAttachments = BasePrismaMapper.mapQuestionAttachments(attachments)
    if (mappedAttachments) {
      response.attachments = mappedAttachments
    }
    const mappedAuthor = BasePrismaMapper.mapAuthor(author ?? null)
    if (mappedAuthor) {
      response.author = mappedAuthor
    }
  }
}
