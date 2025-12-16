import { Injectable } from '@nestjs/common'
import { eq, desc, asc, count } from 'drizzle-orm'
import { PaginationParams } from '@/core/domain/application/pagination-params'
import type {
  FindManyQuestionsParams,
  FindQuestionBySlugParams,
  FindQuestionsResult,
  PaginatedQuestions,
  QuestionsRepository,
  QuestionWithRelations,
  UpdateQuestionData,
} from '@/domain/application/repositories/questions.repository'
import type { AnswerAttachment } from '@/domain/enterprise/entities/answer-attachment.entity'
import type { AnswerComment } from '@/domain/enterprise/entities/answer-comment.entity'
import type { Question, QuestionProps } from '@/domain/enterprise/entities/question.entity'
import type { QuestionAttachment } from '@/domain/enterprise/entities/question-attachment.entity'
import type { QuestionComment } from '@/domain/enterprise/entities/question-comment.entity'
import type { User } from '@/domain/enterprise/entities/user.entity'
import { DrizzleService } from '@/infra/persistence/drizzle/drizzle.service'
import { questions, answers, comments, attachments, users } from '@/infra/persistence/drizzle/schema'
import { BaseDrizzleRepository } from './base/base-drizzle.repository'

@Injectable()
export class DrizzleQuestionsRepository extends BaseDrizzleRepository implements QuestionsRepository {
  constructor (private readonly drizzle: DrizzleService) {
    super()
  }

  async create (data: QuestionProps): Promise<Question> {
    const [question] = await this.drizzle.db.insert(questions).values(data).returning()
    return question
  }

  async findById (questionId: string): Promise<Question | null> {
    const [question] = await this.drizzle.db
      .select()
      .from(questions)
      .where(eq(questions.id, questionId))
      .limit(1)
    return question ?? null
  }

  async findByTitle (questionTitle: string): Promise<Question | null> {
    const [question] = await this.drizzle.db
      .select()
      .from(questions)
      .where(eq(questions.title, questionTitle))
      .limit(1)
    return question ?? null
  }

  async findBySlug ({
    slug,
    page = 1,
    pageSize = 10,
    order = 'desc',
    include = [],
    answerIncludes = [],
  }: FindQuestionBySlugParams): Promise<FindQuestionsResult> {
    const pagination = this.sanitizePagination(page, pageSize)
    const orderFn = order === 'desc' ? desc : asc
    const [question] = await this.drizzle.db
      .select()
      .from(questions)
      .where(eq(questions.slug, slug))
      .limit(1)
    if (!question) return null
    const [answersCount] = await this.drizzle.db
      .select({ count: count() })
      .from(answers)
      .where(eq(answers.questionId, question.id))
    const totalAnswers = answersCount.count
    const includeAnswerAuthor = answerIncludes.includes('author')
    const includeAnswerComments = answerIncludes.includes('comments')
    const includeAnswerAttachments = answerIncludes.includes('attachments')
    const answersList = await this.drizzle.db.query.answers.findMany({
      where: eq(answers.questionId, question.id),
      orderBy: orderFn(answers.createdAt),
      offset: pagination.offset,
      limit: pagination.limit,
      with: {
        author: includeAnswerAuthor || undefined,
        comments: includeAnswerComments || undefined,
        attachments: includeAnswerAttachments || undefined,
      },
    })
    const result: QuestionWithRelations = {
      ...question,
      answers: {
        page: pagination.page,
        pageSize: Math.min(pagination.pageSize, totalAnswers),
        totalItems: totalAnswers,
        totalPages: Math.ceil(totalAnswers / pagination.pageSize),
        order,
        items: answersList.map(a => ({
          ...a,
          comments: includeAnswerComments && Array.isArray(a.comments)
            ? a.comments.map((c): AnswerComment => ({
              ...c,
              answerId: c.answerId!,
              updatedAt: c.updatedAt ?? c.createdAt,
            }))
            : undefined,
          attachments: includeAnswerAttachments && Array.isArray(a.attachments)
            ? a.attachments.map((att): AnswerAttachment => ({
              id: att.id,
              title: att.title,
              url: att.link,
              answerId: att.answerId!,
              createdAt: att.createdAt,
              updatedAt: att.updatedAt ?? att.createdAt,
            }))
            : undefined,
          author: includeAnswerAuthor && a.author
            ? {
              id: a.author.id,
              name: a.author.name,
              email: a.author.email,
              createdAt: a.author.createdAt,
              updatedAt: a.author.updatedAt,
            }
            : undefined,
        })),
      },
    }
    if (include.includes('author')) {
      const [author] = await this.drizzle.db
        .select({ id: users.id, name: users.name, email: users.email, createdAt: users.createdAt, updatedAt: users.updatedAt })
        .from(users)
        .where(eq(users.id, question.authorId))
      if (author) result.author = author
    }
    if (include.includes('comments')) {
      const questionComments = await this.drizzle.db
        .select()
        .from(comments)
        .where(eq(comments.questionId, question.id))
        .orderBy(desc(comments.createdAt))
      result.comments = questionComments.map((c): QuestionComment => ({
        ...c,
        questionId: c.questionId!,
        updatedAt: c.updatedAt ?? c.createdAt,
      }))
    }
    if (include.includes('attachments')) {
      const questionAttachments = await this.drizzle.db
        .select()
        .from(attachments)
        .where(eq(attachments.questionId, question.id))
        .orderBy(desc(attachments.createdAt))
      result.attachments = questionAttachments.map((a): QuestionAttachment => ({
        id: a.id,
        title: a.title,
        url: a.link,
        questionId: a.questionId!,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt ?? a.createdAt,
      }))
    }
    return result
  }

  async findMany ({
    page = 1,
    pageSize = 20,
    order = 'desc',
    include = [],
  }: FindManyQuestionsParams): Promise<PaginatedQuestions> {
    const pagination = this.sanitizePagination(page, pageSize)
    const orderFn = order === 'desc' ? desc : asc
    const includeAuthor = include.includes('author')
    const includeComments = include.includes('comments')
    const includeAttachments = include.includes('attachments')
    const [questionsList, [countResult]] = await Promise.all([
      this.drizzle.db.query.questions.findMany({
        orderBy: orderFn(questions.createdAt),
        offset: pagination.offset,
        limit: pagination.limit,
        with: {
          author: includeAuthor || undefined,
          comments: includeComments || undefined,
          attachments: includeAttachments || undefined,
        },
      }),
      this.drizzle.db.select({ count: count() }).from(questions),
    ])
    const totalItems = countResult.count
    return {
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pagination.pageSize),
      order,
      items: questionsList.map(q => this.toQuestionWithRelations(q, includeAuthor, includeComments, includeAttachments)),
    }
  }

  async delete (questionId: string): Promise<void> {
    await this.drizzle.db.delete(questions).where(eq(questions.id, questionId))
  }

  async update ({ data, where }: UpdateQuestionData): Promise<Question> {
    const [updatedQuestion] = await this.drizzle.db
      .update(questions)
      .set(data)
      .where(eq(questions.id, where.id))
      .returning()
    return updatedQuestion
  }

  async findManyByUserId (
    userId: string,
    { page = 1, pageSize = 10, order = 'desc' }: PaginationParams
  ): Promise<PaginatedQuestions> {
    const pagination = this.sanitizePagination(page, pageSize)
    const orderFn = order === 'desc' ? desc : asc
    const [questionsList, [countResult]] = await Promise.all([
      this.drizzle.db
        .select()
        .from(questions)
        .where(eq(questions.authorId, userId))
        .orderBy(orderFn(questions.createdAt))
        .offset(pagination.offset)
        .limit(pagination.limit),
      this.drizzle.db
        .select({ count: count() })
        .from(questions)
        .where(eq(questions.authorId, userId)),
    ])
    const totalItems = countResult.count
    return {
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pagination.pageSize),
      order,
      items: questionsList.map(q => this.toQuestionWithRelations(q, false, false, false)),
    }
  }

  private toQuestionWithRelations (
    q: typeof questions.$inferSelect & {
      author?: typeof users.$inferSelect
      comments?: (typeof comments.$inferSelect)[]
      attachments?: (typeof attachments.$inferSelect)[]
    },
    includeAuthor: boolean,
    includeComments: boolean,
    includeAttachments: boolean
  ): QuestionWithRelations {
    const result: QuestionWithRelations = {
      id: q.id,
      title: q.title,
      slug: q.slug,
      content: q.content,
      authorId: q.authorId,
      bestAnswerId: q.bestAnswerId,
      createdAt: q.createdAt,
      updatedAt: q.updatedAt,
      answers: {
        page: 1,
        pageSize: 20,
        totalItems: 0,
        totalPages: 0,
        items: [],
        order: 'desc',
      },
    }
    if (includeAuthor && q.author) {
      const author: Omit<User, 'password'> = {
        id: q.author.id,
        name: q.author.name,
        email: q.author.email,
        createdAt: q.author.createdAt,
        updatedAt: q.author.updatedAt,
      }
      result.author = author
    }
    if (includeComments && Array.isArray(q.comments)) {
      result.comments = q.comments.map((c): QuestionComment => ({
        ...c,
        questionId: c.questionId!,
        updatedAt: c.updatedAt ?? c.createdAt,
      }))
    }
    if (includeAttachments && Array.isArray(q.attachments)) {
      result.attachments = q.attachments.map((a): QuestionAttachment => ({
        id: a.id,
        title: a.title,
        url: a.link,
        questionId: a.questionId!,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt ?? a.createdAt,
      }))
    }
    return result
  }
}
