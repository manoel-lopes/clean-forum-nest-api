import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import type {
  AnswersRepository,
  FindManyByQuestionIdParams,
  PaginatedAnswers,
  UpdateAnswerData,
} from '@/domain/application/repositories/answers.repository'
import { Answer } from '@/domain/enterprise/entities/answer.entity'
import { BaseTypeOrmRepository } from './base/base-typeorm.repository'

@Injectable()
export class TypeOrmAnswersRepository extends BaseTypeOrmRepository<Answer> implements AnswersRepository {
  constructor (@InjectRepository(Answer) repository: Repository<Answer>) {
    super(repository)
  }

  async update ({ answerId, data }: UpdateAnswerData): Promise<Answer> {
    const updated = await this.updateOne({ id: answerId, ...data })
    return updated
  }

  async findManyByQuestionId ({
    questionId,
    page = 1,
    pageSize = 10,
    order = 'desc',
    include = [],
  }: FindManyByQuestionIdParams): Promise<PaginatedAnswers> {
    const pagination = this.formatPagination(page, pageSize)
    const [items, totalItems] = await this.findAndCount({
      where: { questionId },
      order: { createdAt: order },
      skip: pagination.offset,
      take: pagination.limit,
      relations: include,
    })
    return {
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pagination.pageSize),
      order,
      items,
    }
  }
}
