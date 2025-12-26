import { Inject, Injectable } from '@nestjs/common'
import type { PaginationParams } from '@/core/domain/pagination-params'
import type { UpdateAttachmentData } from '@/domain/application/repositories/base/attachments.repository'
import type {
  PaginatedQuestionAttachments,
  QuestionAttachmentsRepository,
} from '@/domain/application/repositories/question-attachments.repository'
import { CacheTTL } from '@/infra/cache/cache-ttl'
import { RedisCacheService } from '@/infra/cache/redis-cache.service'
import type { QuestionAttachment } from '@/domain/enterprise/entities/question-attachment.entity'
import { BaseCachedRepository } from './base/base-cached.repository'

export const TypeOrmQuestionAttachmentsRepositoryToken = Symbol('TypeOrmQuestionAttachmentsRepositoryToken')

@Injectable()
export class CachedQuestionAttachmentsRepository
  extends BaseCachedRepository
  implements QuestionAttachmentsRepository {
  private readonly cacheKeys = {
    questionAttachment: (id: string) => `question-attachment:${id}`,
    questionAttachmentsByQuestion: (questionId: string, page: number, size: number) =>
      `question-attachments:question:${questionId}:page:${page}:size:${size}`,
    questionAttachmentsByQuestionPattern: (questionId: string) =>
      `question-attachments:question:${questionId}:*`,
  }

  constructor (
    cacheService: RedisCacheService,
    @Inject(TypeOrmQuestionAttachmentsRepositoryToken)
    private readonly questionAttachmentsRepository: QuestionAttachmentsRepository
  ) {
    super(cacheService)
  }

  async save (attachment: QuestionAttachment): Promise<void> {
    await this.questionAttachmentsRepository.save(attachment)
    await this.setCache(this.cacheKeys.questionAttachment(attachment.id), attachment, CacheTTL.ATTACHMENT)
    await this.invalidateCachePattern(this.cacheKeys.questionAttachmentsByQuestionPattern(attachment.questionId))
  }

  async saveMany (attachments: QuestionAttachment[]): Promise<void> {
    await this.questionAttachmentsRepository.saveMany(attachments)
    for (const attachment of attachments) {
      await this.setCache(this.cacheKeys.questionAttachment(attachment.id), attachment, CacheTTL.ATTACHMENT)
      await this.invalidateCachePattern(this.cacheKeys.questionAttachmentsByQuestionPattern(attachment.questionId))
    }
  }

  async findById (attachmentId: string): Promise<QuestionAttachment | null> {
    const cacheKey = this.cacheKeys.questionAttachment(attachmentId)
    const cached = await this.getFromCache<QuestionAttachment>(cacheKey)
    if (cached) return cached
    const attachment = await this.questionAttachmentsRepository.findById(attachmentId)
    if (attachment) await this.setCache(cacheKey, attachment, CacheTTL.ATTACHMENT)
    return attachment
  }

  async findManyByQuestionId (
    questionId: string,
    params: PaginationParams
  ): Promise<PaginatedQuestionAttachments> {
    const { page = 1, pageSize = 10 } = params
    const cacheKey = this.cacheKeys.questionAttachmentsByQuestion(questionId, page, pageSize)
    const cached = await this.getFromCache<PaginatedQuestionAttachments>(cacheKey)
    if (cached) return cached
    const attachments = await this.questionAttachmentsRepository.findManyByQuestionId(questionId, params)
    if (attachments) await this.setCache(cacheKey, attachments, CacheTTL.ATTACHMENTS_LIST)
    return attachments
  }

  async update (attachmentId: string, data: UpdateAttachmentData): Promise<QuestionAttachment> {
    const attachment = await this.questionAttachmentsRepository.update(attachmentId, data)
    await this.setCache(this.cacheKeys.questionAttachment(attachment.id), attachment, CacheTTL.ATTACHMENT)
    await this.invalidateCachePattern(this.cacheKeys.questionAttachmentsByQuestionPattern(attachment.questionId))
    return attachment
  }

  async delete (attachmentId: string | string[]): Promise<void> {
    const ids = Array.isArray(attachmentId) ? attachmentId : [attachmentId]
    for (const id of ids) {
      const attachment = await this.questionAttachmentsRepository.findById(id)
      if (attachment) {
        await this.invalidateCache(this.cacheKeys.questionAttachment(id))
        await this.invalidateCachePattern(
          this.cacheKeys.questionAttachmentsByQuestionPattern(attachment.questionId)
        )
      }
    }
    await this.questionAttachmentsRepository.delete(attachmentId)
  }
}
