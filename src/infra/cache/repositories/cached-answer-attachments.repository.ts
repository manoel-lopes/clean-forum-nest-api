import { Inject, Injectable } from '@nestjs/common'
import type { PaginationParams } from '@/core/domain/pagination-params'
import type {
  AnswerAttachmentsRepository,
  PaginatedAnswerAttachments,
} from '@/domain/application/repositories/answer-attachments.repository'
import type { UpdateAttachmentData } from '@/domain/application/repositories/base/attachments.repository'
import { RedisCacheService } from '@/infra/cache/redis-cache.service'
import type { AnswerAttachment } from '@/domain/enterprise/entities/answer-attachment.entity'
import { BaseCachedRepository } from './base/base-cached.repository'

export const TypeOrmAnswerAttachmentsRepositoryToken = Symbol('TypeOrmAnswerAttachmentsRepositoryToken')

@Injectable()
export class CachedAnswerAttachmentsRepository
  extends BaseCachedRepository
  implements AnswerAttachmentsRepository {
  private readonly ATTACHMENT_TTL = 60 * 60
  private readonly ATTACHMENTS_LIST_TTL = 10 * 60
  private readonly attachmentIdToAnswerId = new Map<string, string>()

  constructor (
    protected readonly cacheService: RedisCacheService,
    @Inject(TypeOrmAnswerAttachmentsRepositoryToken)
    private readonly answerAttachmentsRepository: AnswerAttachmentsRepository
  ) {
    super(cacheService)
  }

  async save (attachment: AnswerAttachment): Promise<void> {
    await this.answerAttachmentsRepository.save(attachment)
    this.attachmentIdToAnswerId.set(attachment.id, attachment.answerId)
    await Promise.all([
      this.setCache(this.getAttachmentCacheKey(attachment.id), attachment, this.ATTACHMENT_TTL),
      this.invalidateCachePattern(this.getAttachmentsByAnswerCachePattern(attachment.answerId)),
    ])
  }

  async saveMany (attachments: AnswerAttachment[]): Promise<void> {
    await this.answerAttachmentsRepository.saveMany(attachments)
    const answerIdsToInvalidate = new Set<string>()
    for (const attachment of attachments) {
      this.attachmentIdToAnswerId.set(attachment.id, attachment.answerId)
      answerIdsToInvalidate.add(attachment.answerId)
    }
    await Promise.all([
      ...attachments.map(attachment =>
        this.setCache(this.getAttachmentCacheKey(attachment.id), attachment, this.ATTACHMENT_TTL)
      ),
      ...Array.from(answerIdsToInvalidate, answerId =>
        this.invalidateCachePattern(this.getAttachmentsByAnswerCachePattern(answerId))
      ),
    ])
  }

  async findById (attachmentId: string): Promise<AnswerAttachment | null> {
    const cacheKey = this.getAttachmentCacheKey(attachmentId)
    const cached = await this.getFromCache<AnswerAttachment>(cacheKey)
    if (cached) {
      this.attachmentIdToAnswerId.set(cached.id, cached.answerId)
      return cached
    }
    const attachment = await this.answerAttachmentsRepository.findById(attachmentId)
    if (attachment) {
      this.attachmentIdToAnswerId.set(attachment.id, attachment.answerId)
      await this.setCache(cacheKey, attachment, this.ATTACHMENT_TTL)
    }
    return attachment
  }

  async findManyByAnswerId (
    answerId: string,
    params: PaginationParams
  ): Promise<PaginatedAnswerAttachments> {
    const { page = 1, pageSize = 10 } = params
    const cacheKey = this.getAttachmentsByAnswerCacheKey(answerId, page, pageSize)
    const cached = await this.getFromCache<PaginatedAnswerAttachments>(cacheKey)
    if (cached) return cached
    const attachments = await this.answerAttachmentsRepository.findManyByAnswerId(answerId, params)
    await this.setCache(cacheKey, attachments, this.ATTACHMENTS_LIST_TTL)
    return attachments
  }

  async update (attachmentId: string, data: UpdateAttachmentData): Promise<AnswerAttachment> {
    const attachment = await this.answerAttachmentsRepository.update(attachmentId, data)
    this.attachmentIdToAnswerId.set(attachment.id, attachment.answerId)
    await Promise.all([
      this.setCache(this.getAttachmentCacheKey(attachment.id), attachment, this.ATTACHMENT_TTL),
      this.invalidateCachePattern(this.getAttachmentsByAnswerCachePattern(attachment.answerId)),
    ])
    return attachment
  }

  async delete (attachmentId: string | string[]): Promise<void> {
    const ids = Array.isArray(attachmentId) ? attachmentId : [attachmentId]
    const answerIdsToInvalidate = new Set<string>()
    for (const id of ids) {
      const answerId = this.attachmentIdToAnswerId.get(id)
      if (answerId) {
        answerIdsToInvalidate.add(answerId)
        this.attachmentIdToAnswerId.delete(id)
      }
    }
    await Promise.all([
      this.answerAttachmentsRepository.delete(attachmentId),
      ...ids.map(id => this.invalidateCache(this.getAttachmentCacheKey(id))),
      ...Array.from(answerIdsToInvalidate, answerId =>
        this.invalidateCachePattern(this.getAttachmentsByAnswerCachePattern(answerId))
      ),
    ])
  }

  private getAttachmentCacheKey (id: string): string {
    return `answer-attachment:${id}`
  }

  private getAttachmentsByAnswerCacheKey (answerId: string, page: number, size: number): string {
    return `answer-attachments:answer:${answerId}:page:${page}:size:${size}`
  }

  private getAttachmentsByAnswerCachePattern (answerId: string): string {
    return `answer-attachments:answer:${answerId}:*`
  }
}
