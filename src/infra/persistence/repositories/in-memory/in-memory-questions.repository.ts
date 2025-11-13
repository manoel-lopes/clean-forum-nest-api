import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type {
  FindManyQuestionsParams,
  FindQuestionBySlugParams,
  FindQuestionsResult,
  PaginatedQuestions,
  QuestionsRepository,
  UpdateQuestionData,
} from '@/domain/application/repositories/questions.repository'
import type { Question } from '@/domain/enterprise/entities/question.entity'
import { BaseInMemoryRepository as BaseRepository } from './base/base-in-memory.repository'

export class InMemoryQuestionsRepository extends BaseRepository<Question> implements QuestionsRepository {
  async update (questionData: UpdateQuestionData): Promise<Question> {
    const question = await this.updateOne({
      where: { id: questionData.where.id },
      data: questionData.data,
    })
    return question
  }

  async findById (questionId: string): Promise<Question | null> {
    return this.findOneBy('id', questionId)
  }

  async findByTitle (questionTitle: string): Promise<Question | null> {
    return this.findOneBy('title', questionTitle)
  }

  async findBySlug (params: FindQuestionBySlugParams): Promise<FindQuestionsResult> {
    return this.findOneBy('slug', params.slug)
  }

  async findMany (params: FindManyQuestionsParams): Promise<PaginatedQuestions> {
    const result = await this.findManyItems(params)
    return result
  }

  async findManyByUserId (userId: string, params: PaginationParams): Promise<PaginatedQuestions> {
    const result = await this.findManyItemsBy({ where: { authorId: userId }, params })
    return result
  }
}
