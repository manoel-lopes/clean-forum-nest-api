import { Inject, Injectable } from '@nestjs/common'
import {
  AnswersRepository,
  FindManyByQuestionIdParams,
  PaginatedAnswers,
  UpdateAnswerData,
} from '@/domain/application/repositories/answers.repository'
import { RedisCacheService } from '@/infra/persistence/repositories/cache/redis-cache.service'
import type { Answer, AnswerProps } from '@/domain/enterprise/entities/answer.entity'
import { BaseCachedRepository } from './base/base-cached.repository'

@Injectable()
export class CachedAnswersRepository
  extends BaseCachedRepository
  implements AnswersRepository {
  private readonly ANSWERS_TTL = 3600
  private readonly ANSWERS_LIST_TTL = 1800
  private readonly answerIdToQuestionId = new Map<string, string>()

  constructor (
    protected readonly redis: RedisCacheService,
    @Inject(AnswersRepository)
    private readonly answersRepository: AnswersRepository
  ) {
    super(redis)
  }

  async create (answerData: AnswerProps): Promise<Answer> {
    const answer = await this.answersRepository.create(answerData)
    this.answerIdToQuestionId.set(answer.id, answer.questionId)
    await this.setCache(this.getAnswerCacheKey(answer.id), answer, this.ANSWERS_TTL)
    await this.invalidateCachePattern(this.getAnswersByQuestionCachePattern(answer.questionId))
    return answer
  }

  async findById (answerId: string): Promise<Answer | null> {
    const cacheKey = this.getAnswerCacheKey(answerId)
    const cached = await this.getFromCache<Answer>(cacheKey)
    if (cached) {
      this.answerIdToQuestionId.set(cached.id, cached.questionId)
      return cached
    }
    const answer = await this.answersRepository.findById(answerId)
    if (answer) {
      this.answerIdToQuestionId.set(answer.id, answer.questionId)
      await this.setCache(cacheKey, answer, this.ANSWERS_TTL)
    }
    return answer
  }

  async findManyByQuestionId (params: FindManyByQuestionIdParams): Promise<PaginatedAnswers> {
    const { questionId, page = 1, pageSize = 20 } = params
    const cacheKey = this.getAnswersByQuestionCacheKey(questionId, page, pageSize)
    const cached = await this.getFromCache<PaginatedAnswers>(cacheKey)
    if (cached) return cached
    const answers = await this.answersRepository.findManyByQuestionId(params)
    await this.setCache(cacheKey, answers, this.ANSWERS_LIST_TTL)
    return answers
  }

  async update ({ answerId, data }: UpdateAnswerData): Promise<Answer> {
    const answer = await this.answersRepository.update({ answerId, data })
    this.answerIdToQuestionId.set(answer.id, answer.questionId)
    await this.setCache(this.getAnswerCacheKey(answer.id), answer, this.ANSWERS_TTL)
    await this.invalidateCachePattern(this.getAnswersByQuestionCachePattern(answer.questionId))
    return answer
  }

  async delete (answerId: string): Promise<void> {
    const questionId = this.answerIdToQuestionId.get(answerId)
    await this.answersRepository.delete(answerId)
    await this.invalidateCache(this.getAnswerCacheKey(answerId))
    if (questionId) {
      await this.invalidateCachePattern(this.getAnswersByQuestionCachePattern(questionId))
    }
    this.answerIdToQuestionId.delete(answerId)
  }

  private getAnswerCacheKey (id: string) {
    return `answer:${id}`
  }

  private getAnswersByQuestionCacheKey (questionId: string, page: number, size: number) {
    return `answers:question:${questionId}:page:${page}:size:${size}`
  }

  private getAnswersByQuestionCachePattern (questionId: string) {
    return `answers:question:${questionId}:*`
  }
}
