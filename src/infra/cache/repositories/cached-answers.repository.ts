import { Inject, Injectable } from '@nestjs/common'
import type {
  AnswersRepository,
  FindManyByQuestionIdParams,
  PaginatedAnswers,
  UpdateAnswerData,
} from '@/domain/application/repositories/answers.repository'
import { CacheTTL } from '@/infra/cache/cache-ttl'
import { RedisCacheService } from '@/infra/cache/redis-cache.service'
import type { Answer } from '@/domain/enterprise/entities/answer.entity'
import { BaseCachedRepository } from './base/base-cached.repository'

export const TypeOrmAnswersRepositoryToken = Symbol('TypeOrmAnswersRepositoryToken')

@Injectable()
export class CachedAnswersRepository extends BaseCachedRepository implements AnswersRepository {
  private readonly cacheKeys = {
    answer: (id: string) => `answer:${id}`,
    answersByQuestion: (questionId: string, page: number, size: number) =>
      `answers:question:${questionId}:page:${page}:size:${size}`,
    answersByQuestionPattern: (questionId: string) => `answers:question:${questionId}:*`,
    answerCommentsByAnswerPattern: (answerId: string) => `answer-comments:answer:${answerId}:*`,
    answerAttachmentsByAnswerPattern: (answerId: string) => `answer-attachments:answer:${answerId}:*`,
  }

  constructor (
    protected readonly cacheService: RedisCacheService,
    @Inject(TypeOrmAnswersRepositoryToken)
    private readonly answersRepository: AnswersRepository
  ) {
    super(cacheService)
  }

  async save (answer: Answer): Promise<void> {
    await this.answersRepository.save(answer)
    await this.setCache(this.cacheKeys.answer(answer.id), answer, CacheTTL.ANSWER)
    await this.invalidateCachePattern(this.cacheKeys.answersByQuestionPattern(answer.questionId))
  }

  async findById (answerId: string): Promise<Answer | null> {
    const cacheKey = this.cacheKeys.answer(answerId)
    const cached = await this.getFromCache<Answer>(cacheKey)
    if (cached) return cached
    const answer = await this.answersRepository.findById(answerId)
    if (answer) await this.setCache(cacheKey, answer, CacheTTL.ANSWER)
    return answer
  }

  async delete (answerId: string): Promise<void> {
    const answer = await this.answersRepository.findById(answerId)
    await this.answersRepository.delete(answerId)
    await this.invalidateCache(this.cacheKeys.answer(answerId))
    if (answer?.questionId) {
      await this.invalidateCachePattern(this.cacheKeys.answersByQuestionPattern(answer.questionId))
    }
    await this.invalidateCachePattern(this.cacheKeys.answerCommentsByAnswerPattern(answerId))
    await this.invalidateCachePattern(this.cacheKeys.answerAttachmentsByAnswerPattern(answerId))
  }

  async update (answerData: UpdateAnswerData): Promise<Answer> {
    const answer = await this.answersRepository.update(answerData)
    await this.setCache(this.cacheKeys.answer(answer.id), answer, CacheTTL.ANSWER)
    await this.invalidateCachePattern(this.cacheKeys.answersByQuestionPattern(answer.questionId))
    return answer
  }

  async findManyByQuestionId (params: FindManyByQuestionIdParams): Promise<PaginatedAnswers> {
    const { questionId, page = 1, pageSize = 10 } = params
    const cacheKey = this.cacheKeys.answersByQuestion(questionId, page, pageSize)
    const cached = await this.getFromCache<PaginatedAnswers>(cacheKey)
    if (cached) return cached
    const answers = await this.answersRepository.findManyByQuestionId(params)
    if (answers) await this.setCache(cacheKey, answers, CacheTTL.ANSWERS_LIST)
    return answers
  }
}
