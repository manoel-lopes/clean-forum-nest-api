import { asc, count, desc, eq } from 'drizzle-orm'
import { Injectable } from '@nestjs/common'
import type {
  AnswersRepository,
  FindManyByQuestionIdParams,
  PaginatedAnswers,
  UpdateAnswerData,
} from '@/domain/application/repositories/answers.repository'
import { DrizzleService } from '@/infra/persistence/drizzle/drizzle.service'
import { answers } from '@/infra/persistence/drizzle/schema'
import { DrizzleAnswerMapper } from '@/infra/persistence/mappers/drizzle/drizzle-answer.mapper'
import type { Answer, AnswerProps } from '@/domain/enterprise/entities/answer.entity'
import { BaseDrizzleRepository } from './base/base-drizzle.repository'

@Injectable()
export class DrizzleAnswersRepository
  extends BaseDrizzleRepository<typeof answers, Answer, AnswerProps>
  implements AnswersRepository {
  constructor (drizzle: DrizzleService) {
    super(drizzle, answers)
  }

  async create (data: AnswerProps): Promise<Answer> {
    return this.save(data)
  }

  async delete (answerId: string): Promise<void> {
    await this.deleteById(answerId)
  }

  async update ({ data, where }: UpdateAnswerData): Promise<Answer> {
    return this.updateOne({ where, data })
  }

  async findManyByQuestionId ({
    questionId,
    page = 1,
    pageSize = 10,
    order = 'desc',
    include = [],
  }: FindManyByQuestionIdParams): Promise<PaginatedAnswers> {
    const pagination = this.sanitizePagination(page, pageSize)
    const orderFn = order === 'desc' ? desc : asc
    const withRelations: Record<string, true> = {}
    if (include.includes('author')) withRelations.author = true
    if (include.includes('comments')) withRelations.comments = true
    if (include.includes('attachments')) withRelations.attachments = true
    const [answersList, [countResult]] = await Promise.all([
      this.drizzle.db.query.answers.findMany({
        where: eq(answers.questionId, questionId),
        orderBy: orderFn(answers.createdAt),
        offset: pagination.offset,
        limit: pagination.limit,
        with: withRelations,
      }),
      this.drizzle.db
        .select({ count: count() })
        .from(answers)
        .where(eq(answers.questionId, questionId)),
    ])
    const totalItems = countResult.count
    return {
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pagination.pageSize),
      order,
      items: answersList.map(DrizzleAnswerMapper.toAnswer),
    }
  }
}
