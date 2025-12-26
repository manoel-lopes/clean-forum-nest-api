import { Inject, Injectable } from '@nestjs/common'
import type { PaginationParams } from '@/core/domain/pagination-params'
import type {
  AnswerAttachmentsRepository,
  PaginatedAnswerAttachments,
} from '@/domain/application/repositories/answer-attachments.repository'
import type { UpdateAttachmentData } from '@/domain/application/repositories/base/attachments.repository'
import { CacheTTL } from '@/infra/cache/cache-ttl'
import { RedisCacheService } from '@/infra/cache/redis-cache.service'
import type { AnswerAttachment } from '@/domain/enterprise/entities/answer-attachment.entity'
import { BaseCachedRepository } from './base/base-cached.repository'

export const TypeOrmAnswerAttachmentsRepositoryToken = Symbol('TypeOrmAnswerAttachmentsRepositoryToken')

@Injectable()
export class CachedAnswerAttachmentsRepository
  extends BaseCachedRepository
  implements AnswerAttachmentsRepository {
  private readonly cacheKeys = {
    answerAttachment: (id: string) => `answer-attachment:${id}`,
    answerAttachmentsByAnswer: (answerId: string, page: number, size: number) =>
      `answer-attachments:answer:${answerId}:page:${page}:size:${size}`,
    answerAttachmentsByAnswerPattern: (answerId: string) =>
      `answer-attachments:answer:${answerId}:*`,
  }

  constructor (
    cacheService: RedisCacheService,
    @Inject(TypeOrmAnswerAttachmentsRepositoryToken)
    private readonly answerAttachmentsRepository: AnswerAttachmentsRepository
  ) {
    super(cacheService)
  }

  async save (attachment: AnswerAttachment): Promise<void> {
    await this.answerAttachmentsRepository.save(attachment)
    await this.setCache(this.cacheKeys.answerAttachment(attachment.id), attachment, CacheTTL.ATTACHMENT)
    await this.invalidateCachePattern(this.cacheKeys.answerAttachmentsByAnswerPattern(attachment.answerId))
  }

  async saveMany (attachments: AnswerAttachment[]): Promise<void> {
    await this.answerAttachmentsRepository.saveMany(attachments)
    for (const attachment of attachments) {
      await this.setCache(this.cacheKeys.answerAttachment(attachment.id), attachment, CacheTTL.ATTACHMENT)
      await this.invalidateCachePattern(this.cacheKeys.answerAttachmentsByAnswerPattern(attachment.answerId))
    }
  }

  async findById (attachmentId: string): Promise<AnswerAttachment | null> {
    const cacheKey = this.cacheKeys.answerAttachment(attachmentId)
    const cached = await this.getFromCache<AnswerAttachment>(cacheKey)
    if (cached) return cached
    const attachment = await this.answerAttachmentsRepository.findById(attachmentId)
    if (attachment) await this.setCache(cacheKey, attachment, CacheTTL.ATTACHMENT)
    return attachment
  }

  async findManyByAnswerId (
    answerId: string,
    params: PaginationParams
  ): Promise<PaginatedAnswerAttachments> {
    const { page = 1, pageSize = 10 } = params
    const cacheKey = this.cacheKeys.answerAttachmentsByAnswer(answerId, page, pageSize)
    const cached = await this.getFromCache<PaginatedAnswerAttachments>(cacheKey)
    if (cached) return cached
    const attachments = await this.answerAttachmentsRepository.findManyByAnswerId(answerId, params)
    if (attachments) await this.setCache(cacheKey, attachments, CacheTTL.ATTACHMENTS_LIST)
    return attachments
  }

  async update (attachmentId: string, data: UpdateAttachmentData): Promise<AnswerAttachment> {
    const attachment = await this.answerAttachmentsRepository.update(attachmentId, data)
    await this.setCache(this.cacheKeys.answerAttachment(attachment.id), attachment, CacheTTL.ATTACHMENT)
    await this.invalidateCachePattern(this.cacheKeys.answerAttachmentsByAnswerPattern(attachment.answerId))
    return attachment
  }

  async delete (attachmentId: string | string[]): Promise<void> {
    const ids = Array.isArray(attachmentId) ? attachmentId : [attachmentId]
    for (const id of ids) {
      const attachment = await this.answerAttachmentsRepository.findById(id)
      if (attachment) {
        await this.invalidateCache(this.cacheKeys.answerAttachment(id))
        await this.invalidateCachePattern(
          this.cacheKeys.answerAttachmentsByAnswerPattern(attachment.answerId)
        )
      }
    }
    await this.answerAttachmentsRepository.delete(attachmentId)
  }
}
