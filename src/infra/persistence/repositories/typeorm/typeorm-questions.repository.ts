import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type {
  FindManyQuestionsParams,
  FindQuestionBySlugParams,
  FindQuestionsResult,
  PaginatedQuestions,
  QuestionsRepository,
  UpdateQuestionData,
} from '@/domain/application/repositories/questions.repository'
import { Question } from '@/domain/enterprise/entities/question.entity'
import { BaseTypeOrmRepository } from './base/base-typeorm.repository'

@Injectable()
export class TypeOrmQuestionsRepository
  extends BaseTypeOrmRepository<Question>
  implements QuestionsRepository {
  constructor (@InjectRepository(Question) repository: Repository<Question>) {
    super(repository)
  }

  async findByTitle (questionTitle: string): Promise<Question | null> {
    return this.findOne({ where: { title: questionTitle } })
  }

  async findBySlug ({
    slug,
    include = [],
  }: FindQuestionBySlugParams): Promise<FindQuestionsResult> {
    return this.findOne({
      where: { slug },
      relations: include,
    })
  }

  async findMany ({
    page = 1,
    pageSize = 20,
    order = 'desc',
    include = [],
  }: FindManyQuestionsParams): Promise<PaginatedQuestions> {
    const pagination = this.formatPagination(page, pageSize)
    const [items, totalItems] = await this.findAndCount({
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
      items,
    }
  }

  async update ({ questionId, data }: UpdateQuestionData): Promise<Question> {
    const updated = await this.updateOne({ id: questionId, ...data })
    return updated
  }

  async findManyByUserId (
    userId: string,
    { page = 1, pageSize = 10, order = 'desc' }: PaginationParams
  ): Promise<PaginatedQuestions> {
    const pagination = this.formatPagination(page, pageSize)
    const [items, totalItems] = await this.findAndCount({
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
      items,
    }
  }
}
