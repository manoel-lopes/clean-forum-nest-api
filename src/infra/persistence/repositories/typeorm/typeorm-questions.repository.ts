import { EntityManager } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type {
  FindManyQuestionsParams,
  FindQuestionBySlugParams,
  FindQuestionsResult,
  PaginatedQuestions,
  QuestionsRepository,
  UpdateQuestionData,
} from '@/domain/application/repositories/questions.repository'
import { TypeOrmQuestionMapper } from '@/infra/persistence/mappers/typeorm/typeorm-question.mapper'
import { Question } from '@/domain/enterprise/entities/question.entity'
import { BaseTypeOrmRepository } from './base/base-typeorm.repository'

@Injectable()
export class TypeOrmQuestionsRepository extends BaseTypeOrmRepository<Question>
  implements QuestionsRepository {
  constructor (
    @InjectEntityManager()
    manager: EntityManager
  ) {
    super(Question, manager)
  }

  async save (question: Question): Promise<Question> {
    const saved = await this.repository.save(question)
    return TypeOrmQuestionMapper.toDomain(saved)
  }

  async findById (questionId: string): Promise<Question | null> {
    const question = await this.repository.findOne({ where: { id: questionId } })
    return question ? TypeOrmQuestionMapper.toDomain(question) : null
  }

  async findByTitle (questionTitle: string): Promise<Question | null> {
    const question = await this.repository.findOne({ where: { title: questionTitle } })
    return question ? TypeOrmQuestionMapper.toDomain(question) : null
  }

  async findBySlug ({
    slug,
    include = [],
  }: FindQuestionBySlugParams): Promise<FindQuestionsResult> {
    const question = await this.repository.findOne({
      where: { slug },
      relations: include,
    })
    if (!question) return null
    return TypeOrmQuestionMapper.toDomain(question)
  }

  async findMany ({
    page = 1,
    pageSize = 20,
    order = 'desc',
    include = [],
  }: FindManyQuestionsParams): Promise<PaginatedQuestions> {
    const pagination = this.sanitizePagination(page, pageSize)
    const [questions, totalItems] = await this.repository.findAndCount({
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
      items: questions.map(TypeOrmQuestionMapper.toDomain),
    }
  }

  async update ({ data, where }: UpdateQuestionData): Promise<Question> {
    const updated = await this.repository.save({ id: where.id, ...data })
    return TypeOrmQuestionMapper.toDomain(updated)
  }

  override async delete (questionId: string): Promise<void> {
    await this.repository.delete(questionId)
  }

  async findManyByUserId (
    userId: string,
    { page = 1, pageSize = 10, order = 'desc' }: PaginationParams
  ): Promise<PaginatedQuestions> {
    const pagination = this.sanitizePagination(page, pageSize)
    const [questions, totalItems] = await this.repository.findAndCount({
      where: { authorId: userId },
      order: { createdAt: order === 'desc' ? 'DESC' : 'ASC' },
      skip: pagination.offset,
      take: pagination.limit,
    })
    return {
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pagination.pageSize),
      order,
      items: questions.map(TypeOrmQuestionMapper.toDomain),
    }
  }
}
