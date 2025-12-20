import { EntityManager } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import type {
  AnswersRepository,
  FindManyByQuestionIdParams,
  PaginatedAnswers,
  UpdateAnswerData,
} from '@/domain/application/repositories/answers.repository'
import { TypeOrmAnswerMapper } from '@/infra/persistence/mappers/typeorm/typeorm-answer.mapper'
import { Answer } from '@/domain/enterprise/entities/answer.entity'
import { BaseTypeOrmRepository } from './base/base-typeorm.repository'

@Injectable()
export class TypeOrmAnswersRepository extends BaseTypeOrmRepository<Answer> implements AnswersRepository {
  constructor (
    @InjectEntityManager()
    manager: EntityManager
  ) {
    super(Answer, manager)
  }

  async save (answer: Answer): Promise<Answer> {
    const saved = await this.repository.save(answer)
    return TypeOrmAnswerMapper.toDomain(saved)
  }

  async findById (answerId: string): Promise<Answer | null> {
    const answer = await this.repository.findOne({ where: { id: answerId } })
    return answer ? TypeOrmAnswerMapper.toDomain(answer) : null
  }

  async update ({ data, where }: UpdateAnswerData): Promise<Answer> {
    const updated = await this.repository.save({ id: where.id, ...data })
    return TypeOrmAnswerMapper.toDomain(updated)
  }

  override async delete (answerId: string): Promise<void> {
    await this.repository.delete(answerId)
  }

  async findManyByQuestionId ({
    questionId,
    page = 1,
    pageSize = 10,
    order = 'desc',
    include = [],
  }: FindManyByQuestionIdParams): Promise<PaginatedAnswers> {
    const pagination = this.sanitizePagination(page, pageSize)
    const [answers, totalItems] = await this.repository.findAndCount({
      where: { questionId },
      order: { createdAt: order === 'desc' ? 'DESC' : 'ASC' },
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
      items: answers.map(TypeOrmAnswerMapper.toDomain),
    }
  }
}
