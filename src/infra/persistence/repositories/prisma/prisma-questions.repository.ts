import { Injectable } from '@nestjs/common'
import { PaginationParams } from '@/core/domain/application/pagination-params'
import type {
  FindManyQuestionsParams,
  FindQuestionBySlugParams,
  FindQuestionsResult,
  PaginatedQuestions,
  QuestionsRepository,
  UpdateQuestionData,
} from '@/domain/application/repositories/questions.repository'
import { formatPagination } from '@/infra/persistence/helpers/format-pagination.helper'
import { PrismaAnswerMapper } from '@/infra/persistence/mappers/prisma/prisma-answer.mapper'
import { PrismaQuestionMapper } from '@/infra/persistence/mappers/prisma/prisma-question.mapper'
import { PrismaService } from '@/infra/persistence/prisma.service'
import type { Question, QuestionProps } from '@/domain/enterprise/entities/question.entity'

@Injectable()
export class PrismaQuestionsRepository implements QuestionsRepository {
  constructor (private readonly prisma: PrismaService) {}

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
    include,
    answerIncludes,
  }: FindQuestionBySlugParams): Promise<FindQuestionsResult> {
    const pagination = formatPagination(page, pageSize)
    const [question, totalAnswers] = await Promise.all([
      this.prisma.question.findUnique({
        where: { slug },
        include: {
          ...include,
          answers: {
            take: pagination.take,
            skip: pagination.skip,
            orderBy: { createdAt: order },
            include: {
              author: true,
              ...answerIncludes,
            },
          },
        }
      }),
      this.prisma.answer.count({ where: { question: { slug } } }),
    ])
    if (!question) return null
    const result = PrismaQuestionMapper.toDomain(question)
    result.answers = {
      items: question.answers.map(PrismaAnswerMapper.toDomain),
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalItems: totalAnswers,
      totalPages: Math.ceil(totalAnswers / pagination.pageSize),
      order,
    }
    return result
  }

  async findMany ({
    page = 1,
    pageSize = 20,
    order = 'desc',
    include,
  }: FindManyQuestionsParams): Promise<PaginatedQuestions> {
    const pagination = formatPagination(page, pageSize)
    const [questions, totalItems] = await Promise.all([
      this.prisma.question.findMany({
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: order },
        include,
      }),
      this.prisma.question.count(),
    ])
    return {
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pagination.pageSize),
      order,
      items: questions.map(PrismaQuestionMapper.toDomain),
    }
  }

  async delete (questionId: string): Promise<void> {
    await this.prisma.question.delete({
      where: { id: questionId },
    })
  }

  async update ({ questionId, data }: UpdateQuestionData): Promise<Question> {
    const updatedQuestion = await this.prisma.question.update({
      where: { id: questionId },
      data,
    })
    return updatedQuestion
  }

  async findManyByUserId (
    userId: string,
    { page = 1, pageSize = 10, order = 'desc' }: PaginationParams
  ): Promise<PaginatedQuestions> {
    const pagination = formatPagination(page, pageSize)
    const [questions, totalItems] = await Promise.all([
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
      items: questions.map(PrismaQuestionMapper.toDomain),
    }
  }
}
