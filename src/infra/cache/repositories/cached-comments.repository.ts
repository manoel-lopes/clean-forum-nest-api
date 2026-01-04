import { Inject, Injectable } from '@nestjs/common'
import type { PaginationParams } from '@/core/domain/pagination-params'
import type {
  CommentsRepository,
  PaginatedComments,
  UpdateCommentData,
} from '@/domain/application/repositories/comments.repository'
import { RedisCacheService } from '@/infra/cache/redis-cache.service'
import type { Comment, CommentProps } from '@/domain/enterprise/entities/comment/comment.entity'
import { BaseCachedRepository } from './base/base-cached.repository'

export const TypeOrmCommentsRepositoryToken = Symbol('TypeOrmCommentsRepositoryToken')

@Injectable()
export class CachedCommentsRepository
  extends BaseCachedRepository
  implements CommentsRepository {
  private readonly COMMENT_TTL = 15 * 60
  private readonly COMMENTS_LIST_TTL = 2 * 60
  private readonly commentIdToAnswerId = new Map<string, string>()

  constructor (
    protected readonly cacheService: RedisCacheService,
    @Inject(TypeOrmCommentsRepositoryToken)
    private readonly commentsRepository: CommentsRepository
  ) {
    super(cacheService)
  }

  async create (commentData: CommentProps): Promise<Comment> {
    const comment = await this.commentsRepository.create(commentData)
    this.commentIdToAnswerId.set(comment.id, comment.answerId)
    await Promise.all([
      this.setCache(this.getCommentCacheKey(comment.id), comment, this.COMMENT_TTL),
      this.invalidateCachePattern(this.getCommentsByAnswerCachePattern(comment.answerId)),
    ])
    return comment
  }

  async findById (commentId: string): Promise<Comment | null> {
    const cacheKey = this.getCommentCacheKey(commentId)
    const cached = await this.getFromCache<Comment>(cacheKey)
    if (cached) {
      this.commentIdToAnswerId.set(cached.id, cached.answerId)
      return cached
    }
    const comment = await this.commentsRepository.findById(commentId)
    if (comment) {
      this.commentIdToAnswerId.set(comment.id, comment.answerId)
      await this.setCache(cacheKey, comment, this.COMMENT_TTL)
    }
    return comment
  }

  async findManyByAnswerId (
    answerId: string,
    params: PaginationParams
  ): Promise<PaginatedComments> {
    const { page = 1, pageSize = 10 } = params
    const cacheKey = this.getCommentsByAnswerCacheKey(answerId, page, pageSize)
    const cached = await this.getFromCache<PaginatedComments>(cacheKey)
    if (cached) return cached
    const comments = await this.commentsRepository.findManyByAnswerId(answerId, params)
    await this.setCache(cacheKey, comments, this.COMMENTS_LIST_TTL)
    return comments
  }

  async update (commentData: UpdateCommentData): Promise<Comment> {
    const comment = await this.commentsRepository.update(commentData)
    this.commentIdToAnswerId.set(comment.id, comment.answerId)
    await Promise.all([
      this.setCache(this.getCommentCacheKey(comment.id), comment, this.COMMENT_TTL),
      this.invalidateCachePattern(this.getCommentsByAnswerCachePattern(comment.answerId)),
    ])
    return comment
  }

  async delete (commentId: string): Promise<void> {
    const answerId = this.commentIdToAnswerId.get(commentId)
    await this.commentsRepository.delete(commentId)
    await this.invalidateCache(this.getCommentCacheKey(commentId))
    if (answerId) {
      await this.invalidateCachePattern(this.getCommentsByAnswerCachePattern(answerId))
    }
    this.commentIdToAnswerId.delete(commentId)
  }

  private getCommentCacheKey (id: string): string {
    return `comment:${id}`
  }

  private getCommentsByAnswerCacheKey (answerId: string, page: number, size: number): string {
    return `comments:answer:${answerId}:page:${page}:size:${size}`
  }

  private getCommentsByAnswerCachePattern (answerId: string): string {
    return `comments:answer:${answerId}:*`
  }
}
