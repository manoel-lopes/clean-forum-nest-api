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
import { RedisCacheService } from '@/infra/cache/redis-cache.service'
import type { Question, QuestionProps } from '@/domain/enterprise/entities/question.entity'
import { BaseCachedRepository } from './base/base-cached.repository'

export const PrismaQuestionsRepositoryToken = Symbol('PrismaQuestionsRepositoryToken')

@Injectable()
export class CachedQuestionsRepository
  extends BaseCachedRepository
  implements QuestionsRepository {
  private readonly QUESTIONS_TTL = 3600
  private readonly QUESTIONS_LIST_TTL = 1800
  private readonly questionIdToAuthorId = new Map<string, string>()

  constructor (
    protected readonly redis: RedisCacheService,
    @Inject(PrismaQuestionsRepositoryToken)
    private readonly questionsRepository: QuestionsRepository
  ) {
    super(redis)
  }

  async create (questionData: QuestionProps): Promise<Question> {
    const question = await this.questionsRepository.create(questionData)
    this.questionIdToAuthorId.set(question.id, question.authorId)
    await this.setCache(this.getQuestionCacheKey(question.id), question, this.QUESTIONS_TTL)
    await this.invalidateCachePattern(this.getQuestionsListCachePattern())
    await this.invalidateCachePattern(this.getQuestionsByUserCachePattern(question.authorId))
    return question
  }

  async findById (questionId: string): Promise<Question | null> {
    const cacheKey = this.getQuestionCacheKey(questionId)
    const cached = await this.getFromCache<Question>(cacheKey)
    if (cached) {
      this.questionIdToAuthorId.set(cached.id, cached.authorId)
      return cached
    }
    const question = await this.questionsRepository.findById(questionId)
    if (question) {
      this.questionIdToAuthorId.set(question.id, question.authorId)
      await this.setCache(cacheKey, question, this.QUESTIONS_TTL)
    }
    return question
  }

  async findByTitle (questionTitle: string): Promise<Question | null> {
    const cacheKey = this.getQuestionByTitleCacheKey(questionTitle)
    const cached = await this.getFromCache<Question>(cacheKey)
    if (cached) {
      this.questionIdToAuthorId.set(cached.id, cached.authorId)
      return cached
    }
    const question = await this.questionsRepository.findByTitle(questionTitle)
    if (question) {
      this.questionIdToAuthorId.set(question.id, question.authorId)
      await this.setCache(cacheKey, question, this.QUESTIONS_TTL)
    }
    return question
  }

  async findBySlug (params: FindQuestionBySlugParams): Promise<FindQuestionsResult | null> {
    const question = await this.questionsRepository.findBySlug(params)
    return question
  }

  async findMany (params: FindManyQuestionsParams): Promise<PaginatedQuestions> {
    const { page = 1, pageSize = 20 } = params
    const cacheKey = this.getQuestionsListCacheKey(page, pageSize)
    const cached = await this.getFromCache<PaginatedQuestions>(cacheKey)
    if (cached) return cached
    const questions = await this.questionsRepository.findMany(params)
    await this.setCache(cacheKey, questions, this.QUESTIONS_LIST_TTL)
    return questions
  }

  async findManyByUserId (userId: string, params: PaginationParams): Promise<PaginatedQuestions> {
    const { page = 1, pageSize = 10 } = params
    const cacheKey = this.getQuestionsByUserCacheKey(userId, page, pageSize)
    const cached = await this.getFromCache<PaginatedQuestions>(cacheKey)
    if (cached) return cached
    const questions = await this.questionsRepository.findManyByUserId(userId, params)
    await this.setCache(cacheKey, questions, this.QUESTIONS_LIST_TTL)
    return questions
  }

  async update ({ questionId, data }: UpdateQuestionData): Promise<Question> {
    const question = await this.questionsRepository.update({ questionId, data })
    this.questionIdToAuthorId.set(question.id, question.authorId)
    await this.setCache(this.getQuestionCacheKey(question.id), question, this.QUESTIONS_TTL)
    await this.invalidateCachePattern(this.getQuestionsListCachePattern())
    await this.invalidateCachePattern(this.getQuestionsByUserCachePattern(question.authorId))
    return question
  }

  async delete (questionId: string): Promise<void> {
    const authorId = this.questionIdToAuthorId.get(questionId)
    await this.questionsRepository.delete(questionId)
    await this.invalidateCache(this.getQuestionCacheKey(questionId))
    await this.invalidateCachePattern(this.getQuestionsListCachePattern())
    if (authorId) {
      await this.invalidateCachePattern(this.getQuestionsByUserCachePattern(authorId))
    }
    this.questionIdToAuthorId.delete(questionId)
  }

  private getQuestionCacheKey (id: string) {
    return `question:${id}`
  }

  private getQuestionByTitleCacheKey (title: string) {
    return `question:title:${title}`
  }

  private getQuestionsListCacheKey (page: number, size: number) {
    return `questions:list:page:${page}:size:${size}`
  }

  private getQuestionsListCachePattern () {
    return 'questions:list:*'
  }

  private getQuestionsByUserCacheKey (userId: string, page: number, size: number) {
    return `questions:user:${userId}:page:${page}:size:${size}`
  }

  private getQuestionsByUserCachePattern (userId: string) {
    return `questions:user:${userId}:*`
  }
}
