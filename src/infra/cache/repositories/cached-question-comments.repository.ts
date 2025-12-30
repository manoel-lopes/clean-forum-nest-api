import { Inject, Injectable } from '@nestjs/common'
import type { PaginationParams } from '@/core/domain/pagination-params'
import type { UpdateCommentData } from '@/domain/application/repositories/base/comments.repository'
import type {
  PaginatedQuestionComments,
  QuestionCommentsRepository,
} from '@/domain/application/repositories/question-comments.repository'
import { RedisCacheService } from '@/infra/cache/redis-cache.service'
import type { Comment } from '@/domain/enterprise/entities/base/comment.entity'
import { BaseCachedRepository } from './base/base-cached.repository'

export const TypeOrmQuestionCommentsRepositoryToken = Symbol('TypeOrmQuestionCommentsRepositoryToken')

@Injectable()
export class CachedQuestionCommentsRepository
  extends BaseCachedRepository
  implements QuestionCommentsRepository {
  private readonly COMMENT_TTL = 15 * 60
  private readonly COMMENTS_LIST_TTL = 2 * 60
  private readonly commentIdToQuestionId = new Map<string, string>()

  constructor (
    protected readonly cacheService: RedisCacheService,
    @Inject(TypeOrmQuestionCommentsRepositoryToken)
    private readonly questionCommentsRepository: QuestionCommentsRepository
  ) {
    super(cacheService)
  }

  async save (comment: Comment): Promise<void> {
    await this.questionCommentsRepository.save(comment)
    if (comment.questionId) {
      this.commentIdToQuestionId.set(comment.id, comment.questionId)
      await Promise.all([
        this.setCache(this.getCommentCacheKey(comment.id), comment, this.COMMENT_TTL),
        this.invalidateCachePattern(this.getCommentsByQuestionCachePattern(comment.questionId)),
      ])
    } else {
      await this.setCache(this.getCommentCacheKey(comment.id), comment, this.COMMENT_TTL)
    }
  }

  async findById (commentId: string): Promise<Comment | null> {
    const cacheKey = this.getCommentCacheKey(commentId)
    const cached = await this.getFromCache<Comment>(cacheKey)
    if (cached) {
      if (cached.questionId) this.commentIdToQuestionId.set(cached.id, cached.questionId)
      return cached
    }
    const comment = await this.questionCommentsRepository.findById(commentId)
    if (comment) {
      if (comment.questionId) this.commentIdToQuestionId.set(comment.id, comment.questionId)
      await this.setCache(cacheKey, comment, this.COMMENT_TTL)
    }
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

  async update (commentData: UpdateCommentData): Promise<Comment> {
    const comment = await this.questionCommentsRepository.update(commentData)
    if (comment.questionId) {
      this.commentIdToQuestionId.set(comment.id, comment.questionId)
      await Promise.all([
        this.setCache(this.getCommentCacheKey(comment.id), comment, this.COMMENT_TTL),
        this.invalidateCachePattern(this.getCommentsByQuestionCachePattern(comment.questionId)),
      ])
    } else {
      await this.setCache(this.getCommentCacheKey(comment.id), comment, this.COMMENT_TTL)
    }
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

  private getCommentCacheKey (id: string): string {
    return `question-comment:${id}`
  }

  private getCommentsByQuestionCacheKey (questionId: string, page: number, size: number): string {
    return `question-comments:question:${questionId}:page:${page}:size:${size}`
  }

  private getCommentsByQuestionCachePattern (questionId: string): string {
    return `question-comments:question:${questionId}:*`
  }
}
