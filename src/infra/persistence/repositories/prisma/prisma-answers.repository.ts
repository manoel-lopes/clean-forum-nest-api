import { Injectable } from '@nestjs/common'
import type {
  AnswersRepository,
  FindManyByQuestionIdParams,
  PaginatedAnswers,
  UpdateAnswerData,
} from '@/domain/application/repositories/answers.repository'
import { PrismaAnswerMapper } from '@/infra/persistence/mappers/prisma/prisma-answer.mapper'
import { PrismaService } from '@/infra/persistence/prisma.service'
import type { Answer, AnswerProps } from '@/domain/enterprise/entities/answer.entity'
import { BasePrismaRepository } from './base/base-prisma.repository'

@Injectable()
export class PrismaAnswersRepository extends BasePrismaRepository implements AnswersRepository {
  constructor (private readonly prisma: PrismaService) {
    super()
  }

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

  async update ({ where, data }: UpdateAnswerData): Promise<Answer> {
    const updatedAnswer = await this.prisma.answer.update({ where, data })
    return updatedAnswer
  }

  async findManyByQuestionId ({
    questionId,
    page = 1,
    pageSize = 20,
    order = 'desc',
    include = [],
  }: FindManyByQuestionIdParams): Promise<PaginatedAnswers> {
    const pagination = this.sanitizePagination(page, pageSize)
    const [rawAnswers, totalItems] = await this.prisma.$transaction([
      this.prisma.answer.findMany({
        where: { questionId },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: order },
        include: {
          comments: include.includes('comments') ? { orderBy: { createdAt: 'desc' } } : false,
          attachments: include.includes('attachments') ? { orderBy: { createdAt: 'desc' } } : false,
          author: include.includes('author') ? { select: { id: true, name: true, email: true, createdAt: true, updatedAt: true } } : false,
        },
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
