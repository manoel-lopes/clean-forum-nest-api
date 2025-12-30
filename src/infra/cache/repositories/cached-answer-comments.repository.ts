import { Inject, Injectable } from '@nestjs/common'
import type { PaginationParams } from '@/core/domain/pagination-params'
import type {
  AnswerCommentsRepository,
  PaginatedAnswerComments,
} from '@/domain/application/repositories/answer-comments.repository'
import type { UpdateCommentData } from '@/domain/application/repositories/base/comments.repository'
import { RedisCacheService } from '@/infra/cache/redis-cache.service'
import type { Comment } from '@/domain/enterprise/entities/base/comment.entity'
import { BaseCachedRepository } from './base/base-cached.repository'

export const TypeOrmAnswerCommentsRepositoryToken = Symbol('TypeOrmAnswerCommentsRepositoryToken')

@Injectable()
export class CachedAnswerCommentsRepository
  extends BaseCachedRepository
  implements AnswerCommentsRepository {
  private readonly COMMENT_TTL = 15 * 60
  private readonly COMMENTS_LIST_TTL = 2 * 60
  private readonly commentIdToAnswerId = new Map<string, string>()

  constructor (
    protected readonly cacheService: RedisCacheService,
    @Inject(TypeOrmAnswerCommentsRepositoryToken)
    private readonly answerCommentsRepository: AnswerCommentsRepository
  ) {
    super(cacheService)
  }

  async save (comment: Comment): Promise<void> {
    await this.answerCommentsRepository.save(comment)
    if (comment.answerId) {
      this.commentIdToAnswerId.set(comment.id, comment.answerId)
      await Promise.all([
        this.setCache(this.getCommentCacheKey(comment.id), comment, this.COMMENT_TTL),
        this.invalidateCachePattern(this.getCommentsByAnswerCachePattern(comment.answerId)),
      ])
    } else {
      await this.setCache(this.getCommentCacheKey(comment.id), comment, this.COMMENT_TTL)
    }
  }

  async findById (commentId: string): Promise<Comment | null> {
    const cacheKey = this.getCommentCacheKey(commentId)
    const cached = await this.getFromCache<Comment>(cacheKey)
    if (cached) {
      if (cached.answerId) this.commentIdToAnswerId.set(cached.id, cached.answerId)
      return cached
    }
    const comment = await this.answerCommentsRepository.findById(commentId)
    if (comment) {
      if (comment.answerId) this.commentIdToAnswerId.set(comment.id, comment.answerId)
      await this.setCache(cacheKey, comment, this.COMMENT_TTL)
    }
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

  async update (commentData: UpdateCommentData): Promise<Comment> {
    const comment = await this.answerCommentsRepository.update(commentData)
    if (comment.answerId) {
      this.commentIdToAnswerId.set(comment.id, comment.answerId)
      await Promise.all([
        this.setCache(this.getCommentCacheKey(comment.id), comment, this.COMMENT_TTL),
        this.invalidateCachePattern(this.getCommentsByAnswerCachePattern(comment.answerId)),
      ])
    } else {
      await this.setCache(this.getCommentCacheKey(comment.id), comment, this.COMMENT_TTL)
    }
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

  private getCommentCacheKey (id: string): string {
    return `answer-comment:${id}`
  }

  private getCommentsByAnswerCacheKey (answerId: string, page: number, size: number): string {
    return `answer-comments:answer:${answerId}:page:${page}:size:${size}`
  }

  private getCommentsByAnswerCachePattern (answerId: string): string {
    return `answer-comments:answer:${answerId}:*`
  }
}
