import { Inject, Injectable } from '@nestjs/common'
import type {
  AnswersRepository,
  FindManyByQuestionIdParams,
  PaginatedAnswers,
  UpdateAnswerData,
} from '@/domain/application/repositories/answers.repository'
import { RedisCacheService } from '@/infra/cache/redis-cache.service'
import type { Answer } from '@/domain/enterprise/entities/answer/answer.entity'
import { BaseCachedRepository } from './base/base-cached.repository'

export const TypeOrmAnswersRepositoryToken = Symbol('TypeOrmAnswersRepositoryToken')

@Injectable()
export class CachedAnswersRepository extends BaseCachedRepository implements AnswersRepository {
  private readonly ANSWER_TTL = 30 * 60
  private readonly ANSWERS_LIST_TTL = 3 * 60
  private readonly answerIdToQuestionId = new Map<string, string>()

  constructor (
    protected readonly cacheService: RedisCacheService,
    @Inject(TypeOrmAnswersRepositoryToken)
    private readonly answersRepository: AnswersRepository
  ) {
    super(cacheService)
  }

  async save (answer: Answer): Promise<void> {
    await this.answersRepository.save(answer)
    this.answerIdToQuestionId.set(answer.id, answer.questionId)
    await Promise.all([
      this.setCache(this.getAnswerCacheKey(answer.id), answer, this.ANSWER_TTL),
      this.invalidateCachePattern(this.getAnswersByQuestionCachePattern(answer.questionId)),
    ])
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
      await this.setCache(cacheKey, answer, this.ANSWER_TTL)
    }
    return answer
  }

  async delete (answerId: string): Promise<void> {
    const questionId = this.answerIdToQuestionId.get(answerId)
    await this.answersRepository.delete(answerId)
    const invalidations: Promise<void>[] = [
      this.invalidateCache(this.getAnswerCacheKey(answerId)),
      this.invalidateCachePattern(this.getAnswerCommentsByAnswerCachePattern(answerId)),
      this.invalidateCachePattern(this.getAnswerAttachmentsByAnswerCachePattern(answerId)),
    ]
    if (questionId) {
      invalidations.push(this.invalidateCachePattern(this.getAnswersByQuestionCachePattern(questionId)))
    }
    await Promise.all(invalidations)
    this.answerIdToQuestionId.delete(answerId)
  }

  async update (answerData: UpdateAnswerData): Promise<Answer> {
    const answer = await this.answersRepository.update(answerData)
    this.answerIdToQuestionId.set(answer.id, answer.questionId)
    await Promise.all([
      this.setCache(this.getAnswerCacheKey(answer.id), answer, this.ANSWER_TTL),
      this.invalidateCachePattern(this.getAnswersByQuestionCachePattern(answer.questionId)),
    ])
    return answer
  }

  async findManyByQuestionId (params: FindManyByQuestionIdParams): Promise<PaginatedAnswers> {
    const { questionId, page = 1, pageSize = 10 } = params
    const cacheKey = this.getAnswersByQuestionCacheKey(questionId, page, pageSize)
    const cached = await this.getFromCache<PaginatedAnswers>(cacheKey)
    if (cached) return cached
    const answers = await this.answersRepository.findManyByQuestionId(params)
    await this.setCache(cacheKey, answers, this.ANSWERS_LIST_TTL)
    return answers
  }

  private getAnswerCacheKey (id: string): string {
    return `answer:${id}`
  }

  private getAnswersByQuestionCacheKey (questionId: string, page: number, size: number): string {
    return `answers:question:${questionId}:page:${page}:size:${size}`
  }

  private getAnswersByQuestionCachePattern (questionId: string): string {
    return `answers:question:${questionId}:*`
  }

  private getAnswerCommentsByAnswerCachePattern (answerId: string): string {
    return `answer-comments:answer:${answerId}:*`
  }

  private getAnswerAttachmentsByAnswerCachePattern (answerId: string): string {
    return `answer-attachments:answer:${answerId}:*`
  }
}
