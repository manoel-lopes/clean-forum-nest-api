import { Injectable } from '@nestjs/common'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type { UpdateCommentData } from '@/domain/application/repositories/base/comments.repository'
import type {
  PaginatedQuestionComments,
  QuestionCommentsRepository,
} from '@/domain/application/repositories/question-comments.repository'
import { RedisCacheService } from '@/infra/persistence/repositories/cache/redis-cache.service'
import { PrismaQuestionCommentsRepository } from '@/infra/persistence/repositories/prisma/prisma-question-comments.repository'
import type { QuestionComment, QuestionCommentProps } from '@/domain/enterprise/entities/question-comment.entity'
import { BaseCachedRepository } from './base/base-cached.repository'

@Injectable()
export class CachedQuestionCommentsRepository
  extends BaseCachedRepository
  implements QuestionCommentsRepository {
  private readonly COMMENTS_TTL = 3600
  private readonly COMMENTS_LIST_TTL = 1800
  private readonly commentIdToQuestionId = new Map<string, string>()

  constructor (
    protected readonly redis: RedisCacheService,
    private readonly questionCommentsRepository: PrismaQuestionCommentsRepository
  ) {
    super(redis)
  }

  async create (commentData: QuestionCommentProps): Promise<QuestionComment> {
    const comment = await this.questionCommentsRepository.create(commentData)
    if (comment.questionId) {
      this.commentIdToQuestionId.set(comment.id, comment.questionId)
      await this.invalidateCachePattern(this.getCommentsByQuestionCachePattern(comment.questionId))
    }
    await this.setCache(this.getCommentCacheKey(comment.id), comment, this.COMMENTS_TTL)
    return comment
  }

  async findById (commentId: string): Promise<QuestionComment | null> {
    const cacheKey = this.getCommentCacheKey(commentId)
    const cached = await this.getFromCache<QuestionComment>(cacheKey)
    if (cached && cached.questionId) this.commentIdToQuestionId.set(cached.id, cached.questionId)
    if (cached) return cached
    const comment = await this.questionCommentsRepository.findById(commentId)
    if (comment && comment.questionId) this.commentIdToQuestionId.set(comment.id, comment.questionId)
    if (comment) await this.setCache(cacheKey, comment, this.COMMENTS_TTL)
    return comment
  }

  async delete (commentId: string): Promise<void> {
    const questionId = this.commentIdToQuestionId.get(commentId)
    await this.questionCommentsRepository.delete(commentId)
    await this.invalidateCache(this.getCommentCacheKey(commentId))
    if (questionId) {
      await this.invalidateCachePattern(this.getCommentsByQuestionCachePattern(questionId))
    }
    this.commentIdToQuestionId.delete(commentId)
  }

  async update (commentData: UpdateCommentData): Promise<QuestionComment> {
    const comment = await this.questionCommentsRepository.update(commentData)
    if (comment.questionId) {
      this.commentIdToQuestionId.set(comment.id, comment.questionId)
      await this.invalidateCachePattern(this.getCommentsByQuestionCachePattern(comment.questionId))
    }
    await this.setCache(this.getCommentCacheKey(comment.id), comment, this.COMMENTS_TTL)
    return comment
  }

  async findManyByQuestionId (
    questionId: string,
    params: PaginationParams
  ): Promise<PaginatedQuestionComments> {
    const { page = 1, pageSize = 10 } = params
    const cacheKey = this.getCommentsByQuestionCacheKey(questionId, page, pageSize)
    const cached = await this.getFromCache<PaginatedQuestionComments>(cacheKey)
    if (cached) return cached
    const comments = await this.questionCommentsRepository.findManyByQuestionId(questionId, params)
    await this.setCache(cacheKey, comments, this.COMMENTS_LIST_TTL)
    return comments
  }

  private getCommentCacheKey (id: string) {
    return `question-comment:${id}`
  }

  private getCommentsByQuestionCacheKey (questionId: string, page: number, size: number) {
    return `question-comments:question:${questionId}:page:${page}:size:${size}`
  }

  private getCommentsByQuestionCachePattern (questionId: string) {
    return `question-comments:question:${questionId}:*`
  }
}
