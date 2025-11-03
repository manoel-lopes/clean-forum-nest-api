import type { AnswerWithRelations } from '@/domain/application/repositories/answers.repository'
import type { QuestionWithRelations } from '@/domain/application/repositories/questions.repository'
import type { AnswerAttachment } from '@/domain/enterprise/entities/answer-attachment.entity'
import type { AnswerComment } from '@/domain/enterprise/entities/answer-comment.entity'
import type { QuestionAttachment } from '@/domain/enterprise/entities/question-attachment.entity'
import type { QuestionComment } from '@/domain/enterprise/entities/question-comment.entity'
import type { User } from '@/domain/enterprise/entities/user.entity'
import type { Answer, Attachment, Comment, Question } from '@prisma/client'

type PrismaQuestion = Question & {
  answers: (Answer & {
    author?: Pick<User, 'id' | 'name' | 'email' | 'createdAt' | 'updatedAt'>
    comments?: Comment[] | false
    attachments?: Attachment[] | false
  })[]
  comments?: Comment[] | false
  attachments?: Attachment[] | false
  author?: Pick<User, 'id' | 'name' | 'email' | 'createdAt' | 'updatedAt'> | false
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
  author?: Pick<User, 'id' | 'name' | 'email' | 'createdAt' | 'updatedAt'> | false
}

export class PrismaQuestionMapper {
  static toQuestion (raw: PrismaQuestionWithOptionalIncludes): QuestionWithRelations {
    const { comments, attachments, author, ...questionData } = raw
    const response: QuestionWithRelations = {
      ...questionData,
      updatedAt: questionData.updatedAt || questionData.createdAt,
      answers: {
        page: 1,
        pageSize: 20,
        totalItems: 0,
        totalPages: 0,
        items: [],
        order: 'desc',
      },
    }
    if (Array.isArray(comments)) {
      response.comments = comments.map((comment): QuestionComment => ({
        id: comment.id,
        content: comment.content,
        authorId: comment.authorId,
        questionId: comment.questionId!,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt || comment.createdAt,
      }))
    }
    if (Array.isArray(attachments)) {
      response.attachments = attachments.map((attachment): QuestionAttachment => ({
        id: attachment.id,
        title: attachment.title,
        url: attachment.link,
        questionId: attachment.questionId!,
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

  static toDomain (
    raw: PrismaQuestion,
    pagination: PaginationData
  ): QuestionWithRelations {
    const { answers, comments, attachments, author, ...questionData } = raw
    const mappedAnswers: AnswerWithRelations[] = answers.map((answer) => {
      const { comments: answerComments, attachments: answerAttachments, author: answerAuthor, ...answerData } = answer
      const mappedAnswer: AnswerWithRelations = {
        ...answerData,
        updatedAt: answerData.updatedAt || answerData.createdAt,
      }
      if (Array.isArray(answerComments)) {
        mappedAnswer.comments = answerComments.map((comment): AnswerComment => ({
          id: comment.id,
          content: comment.content,
          authorId: comment.authorId,
          answerId: comment.answerId!,
          createdAt: comment.createdAt,
          updatedAt: comment.updatedAt || comment.createdAt,
        }))
      }
      if (Array.isArray(answerAttachments)) {
        mappedAnswer.attachments = answerAttachments.map((attachment): AnswerAttachment => ({
          id: attachment.id,
          title: attachment.title,
          url: attachment.link,
          answerId: attachment.answerId!,
          createdAt: attachment.createdAt,
          updatedAt: attachment.updatedAt || attachment.createdAt,
        }))
      }
      if (answerAuthor && typeof answerAuthor === 'object') {
        mappedAnswer.author = {
          id: answerAuthor.id,
          name: answerAuthor.name,
          email: answerAuthor.email,
          createdAt: answerAuthor.createdAt,
          updatedAt: answerAuthor.updatedAt,
        }
      }
      return mappedAnswer
    })
    const response: QuestionWithRelations = {
      ...questionData,
      updatedAt: questionData.updatedAt || questionData.createdAt,
      answers: {
        page: pagination.page,
        pageSize: pagination.pageSize,
        totalItems: pagination.totalItems,
        totalPages: pagination.totalPages,
        items: mappedAnswers,
        order: pagination.order,
      },
    }
    if (Array.isArray(comments)) {
      response.comments = comments.map((comment): QuestionComment => ({
        id: comment.id,
        content: comment.content,
        authorId: comment.authorId,
        questionId: comment.questionId!,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt || comment.createdAt,
      }))
    }
    if (Array.isArray(attachments)) {
      response.attachments = attachments.map((attachment): QuestionAttachment => ({
        id: attachment.id,
        title: attachment.title,
        url: attachment.link,
        questionId: attachment.questionId!,
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
