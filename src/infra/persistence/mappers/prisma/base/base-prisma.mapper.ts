import type { Attachment, Comment } from '@prisma/client'
import type { AnswerAttachment } from '@/domain/enterprise/entities/answer-attachment.entity'
import type { AnswerComment } from '@/domain/enterprise/entities/answer-comment.entity'
import type { QuestionAttachment } from '@/domain/enterprise/entities/question-attachment.entity'
import type { QuestionComment } from '@/domain/enterprise/entities/question-comment.entity'

type Author = {
  id: string
  name: string
  email: string
  createdAt: Date
  updatedAt: Date
}

type PrismaAuthor = {
  id: string
  name: string
  email: string
  createdAt: Date
  updatedAt: Date | null
}

export class BasePrismaMapper {
  static normalizeTimestamp (updatedAt: Date | null, createdAt: Date): Date {
    return updatedAt ?? createdAt
  }

  static mapAuthor (author: PrismaAuthor | false | null): Author | null {
    if (!author || typeof author !== 'object') {
      return null
    }
    return {
      id: author.id,
      name: author.name,
      email: author.email,
      createdAt: author.createdAt,
      updatedAt: author.updatedAt ?? author.createdAt,
    }
  }

  static mapQuestionComment (raw: Comment): QuestionComment {
    if (!raw.questionId) {
      throw new Error('Comment is not a question comment')
    }
    return {
      id: raw.id,
      content: raw.content,
      authorId: raw.authorId,
      questionId: raw.questionId,
      createdAt: raw.createdAt,
      updatedAt: BasePrismaMapper.normalizeTimestamp(raw.updatedAt, raw.createdAt),
    }
  }

  static mapAnswerComment (raw: Comment): AnswerComment {
    if (!raw.answerId) {
      throw new Error('Comment is not an answer comment')
    }
    return {
      id: raw.id,
      content: raw.content,
      authorId: raw.authorId,
      answerId: raw.answerId,
      createdAt: raw.createdAt,
      updatedAt: BasePrismaMapper.normalizeTimestamp(raw.updatedAt, raw.createdAt),
    }
  }

  static mapQuestionAttachment (raw: Attachment): QuestionAttachment {
    if (!raw.questionId) {
      throw new Error('Attachment is not a question attachment')
    }
    return {
      id: raw.id,
      title: raw.title,
      url: raw.link,
      questionId: raw.questionId,
      createdAt: raw.createdAt,
      updatedAt: BasePrismaMapper.normalizeTimestamp(raw.updatedAt, raw.createdAt),
    }
  }

  static mapAnswerAttachment (raw: Attachment): AnswerAttachment {
    if (!raw.answerId) {
      throw new Error('Attachment is not an answer attachment')
    }
    return {
      id: raw.id,
      title: raw.title,
      url: raw.link,
      answerId: raw.answerId,
      createdAt: raw.createdAt,
      updatedAt: BasePrismaMapper.normalizeTimestamp(raw.updatedAt, raw.createdAt),
    }
  }

  static mapQuestionComments (comments: Comment[] | false | null | undefined): QuestionComment[] | null {
    if (!Array.isArray(comments)) {
      return null
    }
    return comments.map(BasePrismaMapper.mapQuestionComment)
  }

  static mapAnswerComments (comments: Comment[] | false | null | undefined): AnswerComment[] | null {
    if (!Array.isArray(comments)) {
      return null
    }
    return comments.map(BasePrismaMapper.mapAnswerComment)
  }

  static mapQuestionAttachments (attachments: Attachment[] | false | null | undefined): QuestionAttachment[] | null {
    if (!Array.isArray(attachments)) {
      return null
    }
    return attachments.map(BasePrismaMapper.mapQuestionAttachment)
  }

  static mapAnswerAttachments (attachments: Attachment[] | false | null | undefined): AnswerAttachment[] | null {
    if (!Array.isArray(attachments)) {
      return null
    }
    return attachments.map(BasePrismaMapper.mapAnswerAttachment)
  }
}
