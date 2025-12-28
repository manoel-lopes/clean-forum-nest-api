import { Injectable } from '@nestjs/common'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type {
  AnswerCommentsRepository,
  PaginatedAnswerComments,
} from '@/domain/application/repositories/answer-comments.repository'
import type { UpdateCommentData } from '@/domain/application/repositories/base/comments.repository'
import { RedisCacheService } from '@/infra/persistence/repositories/cache/redis-cache.service'
import type { AnswerComment, AnswerCommentProps } from '@/domain/enterprise/entities/answer-comment.entity'
import { PrismaAnswerCommentsRepository } from '../../prisma/prisma-answer-comments.repository'
import { BaseCachedRepository } from './base/base-cached.repository'

@Injectable()
export class CachedAnswerCommentsRepository
  extends BaseCachedRepository
  implements AnswerCommentsRepository {
  private readonly COMMENTS_TTL = 3600
  private readonly COMMENTS_LIST_TTL = 1800
  private readonly commentIdToAnswerId = new Map<string, string>()

  constructor (
    protected readonly redis: RedisCacheService,
    private readonly answerCommentsRepository: PrismaAnswerCommentsRepository
  ) {
    super(redis)
  }

  async create (commentData: AnswerCommentProps): Promise<AnswerComment> {
    const comment = await this.answerCommentsRepository.create(commentData)
    if (comment.answerId) {
      this.commentIdToAnswerId.set(comment.id, comment.answerId)
      await this.invalidateCachePattern(this.getCommentsByAnswerCachePattern(comment.answerId))
    }
    await this.setCache(this.getCommentCacheKey(comment.id), comment, this.COMMENTS_TTL)
    return comment
  }

  async findById (commentId: string): Promise<AnswerComment | null> {
    const cacheKey = this.getCommentCacheKey(commentId)
    const cached = await this.getFromCache<AnswerComment>(cacheKey)
    if (cached && cached.answerId) this.commentIdToAnswerId.set(cached.id, cached.answerId)
    if (cached) return cached
    const comment = await this.answerCommentsRepository.findById(commentId)
    if (comment && comment.answerId) this.commentIdToAnswerId.set(comment.id, comment.answerId)
    if (comment) await this.setCache(cacheKey, comment, this.COMMENTS_TTL)
    return comment
  }

  async delete (commentId: string): Promise<void> {
    const answerId = this.commentIdToAnswerId.get(commentId)
    await this.answerCommentsRepository.delete(commentId)
    await this.invalidateCache(this.getCommentCacheKey(commentId))
    if (answerId) {
      await this.invalidateCachePattern(this.getCommentsByAnswerCachePattern(answerId))
    }
    this.commentIdToAnswerId.delete(commentId)
  }

  async update (commentData: UpdateCommentData): Promise<AnswerComment> {
    const comment = await this.answerCommentsRepository.update(commentData)
    if (comment.answerId) {
      this.commentIdToAnswerId.set(comment.id, comment.answerId)
      await this.invalidateCachePattern(this.getCommentsByAnswerCachePattern(comment.answerId))
    }
    await this.setCache(this.getCommentCacheKey(comment.id), comment, this.COMMENTS_TTL)
    return comment
  }

  async findManyByAnswerId (
    answerId: string,
    params: PaginationParams
  ): Promise<PaginatedAnswerComments> {
    const { page = 1, pageSize = 10 } = params
    const cacheKey = this.getCommentsByAnswerCacheKey(answerId, page, pageSize)
    const cached = await this.getFromCache<PaginatedAnswerComments>(cacheKey)
    if (cached) return cached
    const comments = await this.answerCommentsRepository.findManyByAnswerId(answerId, params)
    await this.setCache(cacheKey, comments, this.COMMENTS_LIST_TTL)
    return comments
  }

  private getCommentCacheKey (id: string) {
    return `answer-comment:${id}`
  }

  private getCommentsByAnswerCacheKey (answerId: string, page: number, size: number) {
    return `answer-comments:answer:${answerId}:page:${page}:size:${size}`
  }

  private getCommentsByAnswerCachePattern (answerId: string) {
    return `answer-comments:answer:${answerId}:*`
  }
}
