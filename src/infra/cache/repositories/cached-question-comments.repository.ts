import { Inject, Injectable } from '@nestjs/common'
import type { PaginationParams } from '@/core/domain/pagination-params'
import type { UpdateCommentData } from '@/domain/application/repositories/base/comments.repository'
import type {
  PaginatedQuestionComments,
  QuestionCommentsRepository,
} from '@/domain/application/repositories/question-comments.repository'
import { CacheTTL } from '@/infra/cache/cache-ttl'
import { RedisCacheService } from '@/infra/cache/redis-cache.service'
import type { Comment } from '@/domain/enterprise/entities/base/comment.entity'
import { BaseCachedRepository } from './base/base-cached.repository'

export const TypeOrmQuestionCommentsRepositoryToken = Symbol('TypeOrmQuestionCommentsRepositoryToken')

@Injectable()
export class CachedQuestionCommentsRepository
  extends BaseCachedRepository
  implements QuestionCommentsRepository {
  private readonly cacheKeys = {
    questionComment: (id: string) => `question-comment:${id}`,
    questionCommentsByQuestion: (questionId: string, page: number, size: number) =>
      `question-comments:question:${questionId}:page:${page}:size:${size}`,
    questionCommentsByQuestionPattern: (questionId: string) =>
      `question-comments:question:${questionId}:*`,
  }

  constructor (
    protected readonly cacheService: RedisCacheService,
    @Inject(TypeOrmQuestionCommentsRepositoryToken)
    private readonly questionCommentsRepository: QuestionCommentsRepository
  ) {
    super(cacheService)
  }

  async save (comment: Comment): Promise<void> {
    await this.questionCommentsRepository.save(comment)
    await this.setCache(this.cacheKeys.questionComment(comment.id), comment, CacheTTL.COMMENT)
    if (comment.questionId) {
      await this.invalidateCachePattern(this.cacheKeys.questionCommentsByQuestionPattern(comment.questionId))
    }
  }

  async findById (commentId: string): Promise<Comment | null> {
    const cacheKey = this.cacheKeys.questionComment(commentId)
    const cached = await this.getFromCache<Comment>(cacheKey)
    if (cached) return cached
    const comment = await this.questionCommentsRepository.findById(commentId)
    if (comment) await this.setCache(cacheKey, comment, CacheTTL.COMMENT)
    return comment
  }

  async delete (commentId: string): Promise<void> {
    const comment = await this.questionCommentsRepository.findById(commentId)
    await this.questionCommentsRepository.delete(commentId)
    await this.invalidateCache(this.cacheKeys.questionComment(commentId))
    if (comment?.questionId) {
      await this.invalidateCachePattern(this.cacheKeys.questionCommentsByQuestionPattern(comment.questionId))
    }
  }

  async update (commentData: UpdateCommentData): Promise<Comment> {
    const comment = await this.questionCommentsRepository.update(commentData)
    await this.setCache(this.cacheKeys.questionComment(comment.id), comment, CacheTTL.COMMENT)
    if (comment.questionId) {
      await this.invalidateCachePattern(this.cacheKeys.questionCommentsByQuestionPattern(comment.questionId))
    }
    return comment
  }

  async findManyByQuestionId (
    questionId: string,
    params: PaginationParams
  ): Promise<PaginatedQuestionComments> {
    const { page = 1, pageSize = 10 } = params
    const cacheKey = this.cacheKeys.questionCommentsByQuestion(questionId, page, pageSize)
    const cached = await this.getFromCache<PaginatedQuestionComments>(cacheKey)
    if (cached) return cached
    const comments = await this.questionCommentsRepository.findManyByQuestionId(questionId, params)
    if (comments) await this.setCache(cacheKey, comments, CacheTTL.COMMENTS_LIST)
    return comments
  }
}
