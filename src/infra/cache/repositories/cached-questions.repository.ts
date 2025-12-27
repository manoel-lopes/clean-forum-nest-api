import { Inject, Injectable } from '@nestjs/common'
import type { PaginationParams } from '@/core/domain/pagination-params'
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
import type { Question } from '@/domain/enterprise/entities/question.entity'
import { BaseCachedRepository } from './base/base-cached.repository'

export const TypeOrmQuestionsRepositoryToken = Symbol('TypeOrmQuestionsRepositoryToken')

@Injectable()
export class CachedQuestionsRepository extends BaseCachedRepository implements QuestionsRepository {
  private readonly cacheKeys = {
    question: (id: string) => `question:${id}`,
    questionBySlug: (slug: string) => `question:slug:${slug}`,
    questionsList: (page: number, size: number) => `questions:list:page:${page}:size:${size}`,
    questionsListPattern: () => 'questions:list:*',
    questionsByUser: (userId: string, page: number, size: number) =>
      `questions:user:${userId}:page:${page}:size:${size}`,
    questionsByUserPattern: (userId: string) => `questions:user:${userId}:*`,
    answersByQuestionPattern: (questionId: string) => `answers:question:${questionId}:*`,
    questionCommentsByQuestionPattern: (questionId: string) =>
      `question-comments:question:${questionId}:*`,
    questionAttachmentsByQuestionPattern: (questionId: string) =>
      `question-attachments:question:${questionId}:*`,
  }

  constructor (
    protected readonly cacheService: RedisCacheService,
    @Inject(TypeOrmQuestionsRepositoryToken)
    private readonly questionsRepository: QuestionsRepository
  ) {
    super(cacheService)
  }

  async save (question: Question): Promise<void> {
    await this.questionsRepository.save(question)
    await this.setCache(this.cacheKeys.question(question.id), question, CacheTTL.QUESTION)
    await this.invalidateCachePattern(this.cacheKeys.questionsListPattern())
    await this.invalidateCachePattern(this.cacheKeys.questionsByUserPattern(question.authorId))
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
    return this.questionsRepository.findByTitle(questionTitle)
  }

  async findBySlug (params: FindQuestionBySlugParams): Promise<FindQuestionsResult | null> {
    const cacheKey = this.cacheKeys.questionBySlug(params.slug)
    const cached = await this.getFromCache<FindQuestionsResult>(cacheKey)
    if (cached) return cached
    const result = await this.questionsRepository.findBySlug(params)
    if (result) await this.setCache(cacheKey, result, CacheTTL.QUESTION)
    return result
  }

  async delete (questionId: string): Promise<void> {
    const question = await this.questionsRepository.findById(questionId)
    await this.questionsRepository.delete(questionId)
    await this.invalidateCache(this.cacheKeys.question(questionId))
    if (question?.slug) {
      await this.invalidateCache(this.cacheKeys.questionBySlug(question.slug))
    }
    await this.invalidateCachePattern(this.cacheKeys.questionsListPattern())
    if (question?.authorId) {
      await this.invalidateCachePattern(this.cacheKeys.questionsByUserPattern(question.authorId))
    }
    await this.invalidateCachePattern(this.cacheKeys.answersByQuestionPattern(questionId))
    await this.invalidateCachePattern(this.cacheKeys.questionCommentsByQuestionPattern(questionId))
    await this.invalidateCachePattern(this.cacheKeys.questionAttachmentsByQuestionPattern(questionId))
  }

  async update (questionData: UpdateQuestionData): Promise<Question> {
    const question = await this.questionsRepository.update(questionData)
    await this.setCache(this.cacheKeys.question(question.id), question, CacheTTL.QUESTION)
    if (question.slug) {
      await this.setCache(this.cacheKeys.questionBySlug(question.slug), question, CacheTTL.QUESTION)
    }
    await this.invalidateCachePattern(this.cacheKeys.questionsListPattern())
    await this.invalidateCachePattern(this.cacheKeys.questionsByUserPattern(question.authorId))
    return question
  }

  async findMany (params: FindManyQuestionsParams): Promise<PaginatedQuestions> {
    const { page = 1, pageSize = 20 } = params
    const cacheKey = this.cacheKeys.questionsList(page, pageSize)
    const cached = await this.getFromCache<PaginatedQuestions>(cacheKey)
    if (cached) return cached
    const questions = await this.questionsRepository.findMany(params)
    if (questions) await this.setCache(cacheKey, questions, CacheTTL.QUESTIONS_LIST)
    return questions
  }

  async findManyByUserId (
    userId: string,
    paginationParams: PaginationParams
  ): Promise<PaginatedQuestions> {
    const { page = 1, pageSize = 10 } = paginationParams
    const cacheKey = this.cacheKeys.questionsByUser(userId, page, pageSize)
    const cached = await this.getFromCache<PaginatedQuestions>(cacheKey)
    if (cached) return cached
    const questions = await this.questionsRepository.findManyByUserId(userId, paginationParams)
    if (questions) await this.setCache(cacheKey, questions, CacheTTL.QUESTIONS_LIST)
    return questions
  }
}
