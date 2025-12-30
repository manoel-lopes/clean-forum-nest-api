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
import { RedisCacheService } from '@/infra/cache/redis-cache.service'
import type { Question } from '@/domain/enterprise/entities/question.entity'
import { BaseCachedRepository } from './base/base-cached.repository'

export const TypeOrmQuestionsRepositoryToken = Symbol('TypeOrmQuestionsRepositoryToken')

type QuestionMetadata = {
  authorId: string
  slug?: string
}

@Injectable()
export class CachedQuestionsRepository extends BaseCachedRepository implements QuestionsRepository {
  private readonly QUESTION_TTL = 30 * 60
  private readonly QUESTIONS_LIST_TTL = 3 * 60
  private readonly questionIdToMetadata = new Map<string, QuestionMetadata>()

  constructor (
    protected readonly cacheService: RedisCacheService,
    @Inject(TypeOrmQuestionsRepositoryToken)
    private readonly questionsRepository: QuestionsRepository
  ) {
    super(cacheService)
  }

  async save (question: Question): Promise<void> {
    await this.questionsRepository.save(question)
    this.questionIdToMetadata.set(question.id, { authorId: question.authorId, slug: question.slug })
    await Promise.all([
      this.setCache(this.getQuestionCacheKey(question.id), question, this.QUESTION_TTL),
      this.invalidateCachePattern(this.getQuestionsListCachePattern()),
      this.invalidateCachePattern(this.getQuestionsByUserCachePattern(question.authorId)),
    ])
  }

  async findById (questionId: string): Promise<Question | null> {
    const cacheKey = this.getQuestionCacheKey(questionId)
    const cached = await this.getFromCache<Question>(cacheKey)
    if (cached) {
      this.questionIdToMetadata.set(cached.id, { authorId: cached.authorId, slug: cached.slug })
      return cached
    }
    const question = await this.questionsRepository.findById(questionId)
    if (question) {
      this.questionIdToMetadata.set(question.id, { authorId: question.authorId, slug: question.slug })
      await this.setCache(cacheKey, question, this.QUESTION_TTL)
    }
    return question
  }

  async findByTitle (questionTitle: string): Promise<Question | null> {
    const question = await this.questionsRepository.findByTitle(questionTitle)
    if (question) {
      this.questionIdToMetadata.set(question.id, { authorId: question.authorId, slug: question.slug })
    }
    return question
  }

  async findBySlug (params: FindQuestionBySlugParams): Promise<FindQuestionsResult | null> {
    const cacheKey = this.getQuestionBySlugCacheKey(params.slug)
    const cached = await this.getFromCache<FindQuestionsResult>(cacheKey)
    if (cached) {
      this.questionIdToMetadata.set(cached.id, { authorId: cached.authorId, slug: cached.slug })
      return cached
    }
    const result = await this.questionsRepository.findBySlug(params)
    if (result) {
      this.questionIdToMetadata.set(result.id, { authorId: result.authorId, slug: result.slug })
      await this.setCache(cacheKey, result, this.QUESTION_TTL)
    }
    return result
  }

  async delete (questionId: string): Promise<void> {
    const metadata = this.questionIdToMetadata.get(questionId)
    await this.questionsRepository.delete(questionId)
    const invalidations: Promise<void>[] = [
      this.invalidateCache(this.getQuestionCacheKey(questionId)),
      this.invalidateCachePattern(this.getQuestionsListCachePattern()),
      this.invalidateCachePattern(this.getAnswersByQuestionCachePattern(questionId)),
      this.invalidateCachePattern(this.getQuestionCommentsByQuestionCachePattern(questionId)),
      this.invalidateCachePattern(this.getQuestionAttachmentsByQuestionCachePattern(questionId)),
    ]
    if (metadata?.slug) {
      invalidations.push(this.invalidateCache(this.getQuestionBySlugCacheKey(metadata.slug)))
    }
    if (metadata?.authorId) {
      invalidations.push(this.invalidateCachePattern(this.getQuestionsByUserCachePattern(metadata.authorId)))
    }
    await Promise.all(invalidations)
    this.questionIdToMetadata.delete(questionId)
  }

  async update (questionData: UpdateQuestionData): Promise<Question> {
    const question = await this.questionsRepository.update(questionData)
    this.questionIdToMetadata.set(question.id, { authorId: question.authorId, slug: question.slug })
    const cacheOperations: Promise<void>[] = [
      this.setCache(this.getQuestionCacheKey(question.id), question, this.QUESTION_TTL),
      this.invalidateCachePattern(this.getQuestionsListCachePattern()),
      this.invalidateCachePattern(this.getQuestionsByUserCachePattern(question.authorId)),
    ]
    if (question.slug) {
      cacheOperations.push(
        this.setCache(this.getQuestionBySlugCacheKey(question.slug), question, this.QUESTION_TTL)
      )
    }
    await Promise.all(cacheOperations)
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

  async findManyByUserId (
    userId: string,
    paginationParams: PaginationParams
  ): Promise<PaginatedQuestions> {
    const { page = 1, pageSize = 10 } = paginationParams
    const cacheKey = this.getQuestionsByUserCacheKey(userId, page, pageSize)
    const cached = await this.getFromCache<PaginatedQuestions>(cacheKey)
    if (cached) return cached
    const questions = await this.questionsRepository.findManyByUserId(userId, paginationParams)
    await this.setCache(cacheKey, questions, this.QUESTIONS_LIST_TTL)
    return questions
  }

  private getQuestionCacheKey (id: string): string {
    return `question:${id}`
  }

  private getQuestionBySlugCacheKey (slug: string): string {
    return `question:slug:${slug}`
  }

  private getQuestionsListCacheKey (page: number, size: number): string {
    return `questions:list:page:${page}:size:${size}`
  }

  private getQuestionsListCachePattern (): string {
    return 'questions:list:*'
  }

  private getQuestionsByUserCacheKey (userId: string, page: number, size: number): string {
    return `questions:user:${userId}:page:${page}:size:${size}`
  }

  private getQuestionsByUserCachePattern (userId: string): string {
    return `questions:user:${userId}:*`
  }

  private getAnswersByQuestionCachePattern (questionId: string): string {
    return `answers:question:${questionId}:*`
  }

  private getQuestionCommentsByQuestionCachePattern (questionId: string): string {
    return `question-comments:question:${questionId}:*`
  }

  private getQuestionAttachmentsByQuestionCachePattern (questionId: string): string {
    return `question-attachments:question:${questionId}:*`
  }
}
