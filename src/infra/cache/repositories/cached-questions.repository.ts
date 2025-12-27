import { Inject, Injectable } from '@nestjs/common'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type {
  FindManyQuestionsParams,
  FindQuestionBySlugParams,
  FindQuestionsResult,
  PaginatedQuestions,
  QuestionsRepository,
  UpdateQuestionData,
} from '@/domain/application/repositories/questions.repository'
import { CacheTTL } from '@/infra/cache/cache-ttl'
import { RedisCacheService } from '@/infra/cache/redis-cache.service'
import type { Question, QuestionProps } from '@/domain/enterprise/entities/question.entity'
import { BaseCachedRepository } from './base/base-cached.repository'

export const PrismaQuestionsRepositoryToken = Symbol('PrismaQuestionsRepositoryToken')

@Injectable()
export class CachedQuestionsRepository
  extends BaseCachedRepository
  implements QuestionsRepository {
  private readonly cacheKeys = {
    question: (id: string) => `question:${id}`,
    questionBySlug: (slug: string) => `question:slug:${slug}`,
    questionByTitle: (title: string) => `question:title:${title}`,
    questionsList: (page: number, size: number) => `questions:list:page:${page}:size:${size}`,
    questionsListPattern: () => 'questions:list:*',
    questionsByUserPattern: (userId: string) => `questions:user:${userId}:*`,
    questionsByUser: (userId: string, page: number, size: number) =>
      `questions:user:${userId}:page:${page}:size:${size}`,
  }

  constructor (
    cacheService: RedisCacheService,
    @Inject(PrismaQuestionsRepositoryToken)
    private readonly questionsRepository: QuestionsRepository
  ) {
    super(cacheService)
  }

  async create (question: QuestionProps): Promise<Question> {
    const createdQuestion = await this.questionsRepository.create(question)
    await this.setCache(this.cacheKeys.question(createdQuestion.id), createdQuestion, CacheTTL.QUESTION)
    await this.invalidateCachePattern(this.cacheKeys.questionsListPattern())
    await this.invalidateCachePattern(this.cacheKeys.questionsByUserPattern(createdQuestion.authorId))
    return createdQuestion
  }

  async findById (questionId: string): Promise<Question | null> {
    const cacheKey = this.cacheKeys.question(questionId)
    const cached = await this.getFromCache<Question>(cacheKey)
    if (cached) return cached
    const question = await this.questionsRepository.findById(questionId)
    if (question) await this.setCache(cacheKey, question, CacheTTL.QUESTION)
    return question
  }

  async findByTitle (questionTitle: string): Promise<Question | null> {
    const cacheKey = this.cacheKeys.questionByTitle(questionTitle)
    const cached = await this.getFromCache<Question>(cacheKey)
    if (cached) return cached
    const question = await this.questionsRepository.findByTitle(questionTitle)
    if (question) await this.setCache(cacheKey, question, CacheTTL.QUESTION)
    return question
  }

  async findBySlug (params: FindQuestionBySlugParams): Promise<FindQuestionsResult | null> {
    const question = await this.questionsRepository.findBySlug(params)
    return question
  }

  async findMany (params: FindManyQuestionsParams): Promise<PaginatedQuestions> {
    const { page = 1, pageSize = 20 } = params
    const cacheKey = this.cacheKeys.questionsList(page, pageSize)
    const cached = await this.getFromCache<PaginatedQuestions>(cacheKey)
    if (cached) return cached
    const questions = await this.questionsRepository.findMany(params)
    await this.setCache(cacheKey, questions, CacheTTL.QUESTIONS_LIST)
    return questions
  }

  async findManyByUserId (userId: string, params: PaginationParams): Promise<PaginatedQuestions> {
    const { page = 1, pageSize = 10 } = params
    const cacheKey = this.cacheKeys.questionsByUser(userId, page, pageSize)
    const cached = await this.getFromCache<PaginatedQuestions>(cacheKey)
    if (cached) return cached
    const questions = await this.questionsRepository.findManyByUserId(userId, params)
    await this.setCache(cacheKey, questions, CacheTTL.QUESTIONS_LIST)
    return questions
  }

  async update ({ questionId, data }: UpdateQuestionData): Promise<Question> {
    const question = await this.questionsRepository.update({ questionId, data })
    await this.setCache(this.cacheKeys.question(question.id), question, CacheTTL.QUESTION)
    await this.invalidateCachePattern(this.cacheKeys.questionsListPattern())
    await this.invalidateCachePattern(this.cacheKeys.questionsByUserPattern(question.authorId))
    return question
  }

  async delete (questionId: string): Promise<void> {
    const question = await this.questionsRepository.findById(questionId)
    await this.questionsRepository.delete(questionId)
    await this.invalidateCache(this.cacheKeys.question(questionId))
    await this.invalidateCachePattern(this.cacheKeys.questionsListPattern())
    if (question) {
      await this.invalidateCachePattern(this.cacheKeys.questionsByUserPattern(question.authorId))
    }
  }
}
