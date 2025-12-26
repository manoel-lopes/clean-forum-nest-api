import { Inject, Injectable } from '@nestjs/common'
import type { PaginationParams } from '@/core/domain/pagination-params'
import type {
  AnswerCommentsRepository,
  PaginatedAnswerComments,
} from '@/domain/application/repositories/answer-comments.repository'
import type { UpdateCommentData } from '@/domain/application/repositories/base/comments.repository'
import { CacheTTL } from '@/infra/cache/cache-ttl'
import { RedisCacheService } from '@/infra/cache/redis-cache.service'
import type { Comment } from '@/domain/enterprise/entities/base/comment.entity'
import { BaseCachedRepository } from './base/base-cached.repository'

export const TypeOrmAnswerCommentsRepositoryToken = Symbol('TypeOrmAnswerCommentsRepositoryToken')

@Injectable()
export class CachedAnswerCommentsRepository
  extends BaseCachedRepository
  implements AnswerCommentsRepository {
  private readonly cacheKeys = {
    answerComment: (id: string) => `answer-comment:${id}`,
    answerCommentsByAnswer: (answerId: string, page: number, size: number) =>
      `answer-comments:answer:${answerId}:page:${page}:size:${size}`,
    answerCommentsByAnswerPattern: (answerId: string) =>
      `answer-comments:answer:${answerId}:*`,
  }

  constructor (
    cacheService: RedisCacheService,
    @Inject(TypeOrmAnswerCommentsRepositoryToken)
    private readonly answerCommentsRepository: AnswerCommentsRepository
  ) {
    super(cacheService)
  }

  async save (comment: Comment): Promise<void> {
    await this.answerCommentsRepository.save(comment)
    await this.setCache(this.cacheKeys.answerComment(comment.id), comment, CacheTTL.COMMENT)
    if (comment.answerId) {
      await this.invalidateCachePattern(this.cacheKeys.answerCommentsByAnswerPattern(comment.answerId))
    }
  }

  async findById (commentId: string): Promise<Comment | null> {
    const cacheKey = this.cacheKeys.answerComment(commentId)
    const cached = await this.getFromCache<Comment>(cacheKey)
    if (cached) return cached
    const comment = await this.answerCommentsRepository.findById(commentId)
    if (comment) await this.setCache(cacheKey, comment, CacheTTL.COMMENT)
    return comment
  }

  async delete (commentId: string): Promise<void> {
    const comment = await this.answerCommentsRepository.findById(commentId)
    await this.answerCommentsRepository.delete(commentId)
    await this.invalidateCache(this.cacheKeys.answerComment(commentId))
    if (comment?.answerId) {
      await this.invalidateCachePattern(this.cacheKeys.answerCommentsByAnswerPattern(comment.answerId))
    }
  }

  async update (commentData: UpdateCommentData): Promise<Comment> {
    const comment = await this.answerCommentsRepository.update(commentData)
    await this.setCache(this.cacheKeys.answerComment(comment.id), comment, CacheTTL.COMMENT)
    if (comment.answerId) {
      await this.invalidateCachePattern(this.cacheKeys.answerCommentsByAnswerPattern(comment.answerId))
    }
    return comment
  }

  async findManyByAnswerId (
    answerId: string,
    params: PaginationParams
  ): Promise<PaginatedAnswerComments> {
    const { page = 1, pageSize = 10 } = params
    const cacheKey = this.cacheKeys.answerCommentsByAnswer(answerId, page, pageSize)
    const cached = await this.getFromCache<PaginatedAnswerComments>(cacheKey)
    if (cached) return cached
    const comments = await this.answerCommentsRepository.findManyByAnswerId(answerId, params)
    if (comments) await this.setCache(cacheKey, comments, CacheTTL.COMMENTS_LIST)
    return comments
  }
}
