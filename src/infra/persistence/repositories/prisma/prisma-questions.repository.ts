import { Injectable } from '@nestjs/common'
import type { PaginatedItems } from '@/core/domain/application/paginated-items'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type {
  FindManyQuestionsParams,
  FindQuestionBySlugParams,
  FindQuestionsResult,
  PaginatedQuestions,
  QuestionsRepository,
  UpdateQuestionData,
} from '@/domain/application/repositories/questions.repository'
import { PrismaQuestionMapper } from '@/infra/persistence/mappers/prisma/prisma-question.mapper'
import { PrismaService } from '@/infra/persistence/prisma.service'
import type { Question, QuestionProps } from '@/domain/enterprise/entities/question.entity'
import { BasePrismaRepository } from './base/base-prisma.repository'

@Injectable()
export class PrismaQuestionsRepository extends BasePrismaRepository implements QuestionsRepository {
  constructor (private readonly prisma: PrismaService) {
    super()
  }

  async create (data: QuestionProps): Promise<Question> {
    const question = await this.prisma.question.create({ data })
    return question
  }

  async findById (questionId: string): Promise<Question | null> {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
    })
    if (!question) return null
    return question
  }

  async findByTitle (questionTitle: string): Promise<Question | null> {
    const question = await this.prisma.question.findFirst({
      where: { title: questionTitle },
    })
    if (!question) return null
    return question
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
    const authorSelect = { id: true, name: true, email: true, createdAt: true, updatedAt: true }
    const [question, totalAnswers] = await this.prisma.$transaction([
      this.prisma.question.findUnique({
        where: { slug },
        include: {
          answers: {
            take: pagination.take,
            skip: pagination.skip,
            orderBy: { createdAt: order },
            include: {
              author: { select: authorSelect },
              comments: answerIncludes.includes('comments') ? { orderBy: { createdAt: 'desc' } } : false,
              attachments: answerIncludes.includes('attachments') ? { orderBy: { createdAt: 'desc' } } : false,
            },
          },
          comments: include.includes('comments') ? { where: { answerId: null }, orderBy: { createdAt: 'desc' } } : false,
          attachments: include.includes('attachments') ? { where: { answerId: null }, orderBy: { createdAt: 'desc' } } : false,
          author: include.includes('author') ? { select: authorSelect } : false,
        },
      }),
      this.prisma.answer.count({ where: { question: { slug } } }),
    ])
    if (!question) return null
    return PrismaQuestionMapper.toDomain(question, {
      page: pagination.page,
      pageSize: Math.min(pagination.pageSize, totalAnswers),
      totalItems: totalAnswers,
      totalPages: Math.ceil(totalAnswers / pagination.pageSize),
      order,
    })
  }

  async findMany ({
    page = 1,
    pageSize = 20,
    order = 'desc',
    include = [],
  }: FindManyQuestionsParams): Promise<PaginatedQuestions> {
    const pagination = this.sanitizePagination(page, pageSize)
    const authorSelect = { id: true, name: true, email: true, createdAt: true, updatedAt: true }
    const [questions, totalItems] = await this.prisma.$transaction([
      this.prisma.question.findMany({
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: order },
        include: {
          comments: include.includes('comments') ? { where: { answerId: null }, orderBy: { createdAt: 'desc' } } : false,
          attachments: include.includes('attachments') ? { where: { answerId: null }, orderBy: { createdAt: 'desc' } } : false,
          author: include.includes('author') ? { select: authorSelect } : false,
        },
      }),
      this.prisma.question.count(),
    ])
    return {
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pagination.pageSize),
      order,
      items: questions.map(PrismaQuestionMapper.toQuestion),
    }
  }

  async delete (questionId: string): Promise<void> {
    await this.prisma.question.delete({
      where: { id: questionId },
    })
  }

  async update ({ data, where }: UpdateQuestionData): Promise<Question> {
    const updatedQuestion = await this.prisma.question.update({
      where: {
        id: where.id,
      },
      data,
    })
    return updatedQuestion
  }

  async findManyByUserId (
    userId: string,
    { page = 1, pageSize = 10, order = 'desc' }: PaginationParams
  ): Promise<PaginatedItems<Omit<Question, 'answers'>>> {
    const pagination = this.sanitizePagination(page, pageSize)
    const [questions, totalItems] = await this.prisma.$transaction([
      this.prisma.question.findMany({
        where: { authorId: userId },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: order },
      }),
      this.prisma.question.count({
        where: { authorId: userId },
      }),
    ])
    return {
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pagination.pageSize),
      order,
      items: questions,
    }
  }
}
