import { asc, count, desc, eq } from 'drizzle-orm'
import { Injectable } from '@nestjs/common'
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
import { DrizzleService } from '@/infra/persistence/drizzle/drizzle.service'
import { answers, attachments, comments, questions, users } from '@/infra/persistence/drizzle/schema'
import { DrizzleAnswerMapper } from '@/infra/persistence/mappers/drizzle/drizzle-answer.mapper'
import { DrizzleAttachmentMapper } from '@/infra/persistence/mappers/drizzle/drizzle-attachment.mapper'
import { DrizzleCommentMapper } from '@/infra/persistence/mappers/drizzle/drizzle-comment.mapper'
import { DrizzleQuestionMapper } from '@/infra/persistence/mappers/drizzle/drizzle-question.mapper'
import { DrizzleUserMapper } from '@/infra/persistence/mappers/drizzle/drizzle-user.mapper'
import type { Question, QuestionProps } from '@/domain/enterprise/entities/question.entity'
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
    const answerWithRelations: Record<string, true> = {}
    if (answerIncludes.includes('author')) answerWithRelations.author = true
    if (answerIncludes.includes('comments')) answerWithRelations.comments = true
    if (answerIncludes.includes('attachments')) answerWithRelations.attachments = true
    const answersList = await this.drizzle.db.query.answers.findMany({
      where: eq(answers.questionId, question.id),
      orderBy: orderFn(answers.createdAt),
      offset: pagination.offset,
      limit: pagination.limit,
      with: answerWithRelations,
    })
    const result: QuestionWithRelations = {
      ...question,
      answers: {
        page: pagination.page,
        pageSize: Math.min(pagination.pageSize, totalAnswers),
        totalItems: totalAnswers,
        totalPages: Math.ceil(totalAnswers / pagination.pageSize),
        order,
        items: answersList.map(DrizzleAnswerMapper.toAnswer),
      },
    }
    if (include.includes('author')) {
      const [author] = await this.drizzle.db
        .select()
        .from(users)
        .where(eq(users.id, question.authorId))
      if (author) result.author = DrizzleUserMapper.toAuthor(author)
    }
    if (include.includes('comments')) {
      const questionComments = await this.drizzle.db
        .select()
        .from(comments)
        .where(eq(comments.questionId, question.id))
        .orderBy(desc(comments.createdAt))
      result.comments = questionComments.map(DrizzleCommentMapper.toQuestionComment)
    }
    if (include.includes('attachments')) {
      const questionAttachments = await this.drizzle.db
        .select()
        .from(attachments)
        .where(eq(attachments.questionId, question.id))
        .orderBy(desc(attachments.createdAt))
      result.attachments = questionAttachments.map(DrizzleAttachmentMapper.toQuestionAttachment)
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
    const withRelations: Record<string, true> = {}
    if (include.includes('author')) withRelations.author = true
    if (include.includes('comments')) withRelations.comments = true
    if (include.includes('attachments')) withRelations.attachments = true
    const [questionsList, [countResult]] = await Promise.all([
      this.drizzle.db.query.questions.findMany({
        orderBy: orderFn(questions.createdAt),
        offset: pagination.offset,
        limit: pagination.limit,
        with: withRelations,
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
      items: questionsList.map(DrizzleQuestionMapper.toQuestion),
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
      items: questionsList.map(DrizzleQuestionMapper.toQuestion),
    }
  }
}
