import { Injectable } from '@nestjs/common'
import type {
  AnswersRepository,
  FindManyByQuestionIdParams,
  PaginatedAnswers,
  UpdateAnswerData,
} from '@/domain/application/repositories/answers.repository'
import { formatPagination } from '@/infra/persistence/helpers/format-pagination.helper'
import { PrismaAnswerMapper } from '@/infra/persistence/mappers/prisma/prisma-answer.mapper'
import { PrismaService } from '@/infra/persistence/prisma.service'
import type { Answer, AnswerProps } from '@/domain/enterprise/entities/answer.entity'

@Injectable()
export class PrismaAnswersRepository implements AnswersRepository {
  constructor (private readonly prisma: PrismaService) {}

  async create (data: AnswerProps): Promise<Answer> {
    const answer = await this.prisma.answer.create({ data })
    return answer
  }

  async findById (answerId: string): Promise<Answer | null> {
    const answer = await this.prisma.answer.findUnique({
      where: { id: answerId },
    })
    return answer
  }

  async delete (answerId: string): Promise<void> {
    await this.prisma.answer.delete({
      where: { id: answerId },
    })
  }

  async update ({ answerId, data }: UpdateAnswerData): Promise<Answer> {
    const updatedAnswer = await this.prisma.answer.update({
      where: { id: answerId },
      data,
    })
    return updatedAnswer
  }

  async findManyByQuestionId ({
    questionId,
    page = 1,
    pageSize = 20,
    order = 'desc',
    include,
  }: FindManyByQuestionIdParams): Promise<PaginatedAnswers> {
    const pagination = formatPagination(page, pageSize)
    const [rawAnswers, totalItems] = await Promise.all([
      this.prisma.answer.findMany({
        where: { questionId },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: order },
        include,
      }),
      this.prisma.answer.count({ where: { questionId } }),
    ])
    return {
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pagination.pageSize),
      order,
      items: rawAnswers.map(PrismaAnswerMapper.toDomain),
    }
  }
}
