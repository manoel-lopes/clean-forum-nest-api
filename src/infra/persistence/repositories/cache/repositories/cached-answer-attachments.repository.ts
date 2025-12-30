import { Injectable } from '@nestjs/common'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type {
  AnswerAttachmentsRepository,
  PaginatedAnswerAttachments,
} from '@/domain/application/repositories/answer-attachments.repository'
import { RedisCacheService } from '@/infra/persistence/repositories/cache/redis-cache.service'
import { PrismaAnswerAttachmentsRepository } from '@/infra/persistence/repositories/prisma/prisma-answer-attachments.repository'
import type { AnswerAttachment, AnswerAttachmentProps } from '@/domain/enterprise/entities/answer-attachment.entity'
import { BaseCachedRepository } from './base/base-cached.repository'

@Injectable()
export class CachedAnswerAttachmentsRepository
  extends BaseCachedRepository
  implements AnswerAttachmentsRepository {
  private readonly ATTACHMENTS_TTL = 3600
  private readonly ATTACHMENTS_LIST_TTL = 1800
  private readonly attachmentIdToAnswerId = new Map<string, string>()

  constructor (
    protected readonly redis: RedisCacheService,
    private readonly answerAttachmentsRepository: PrismaAnswerAttachmentsRepository
  ) {
    super(redis)
  }

  async create (attachmentData: AnswerAttachmentProps): Promise<AnswerAttachment> {
    const attachment = await this.answerAttachmentsRepository.create(attachmentData)
    if (attachment.answerId) {
      this.attachmentIdToAnswerId.set(attachment.id, attachment.answerId)
      await this.invalidateCachePattern(this.getAttachmentsByAnswerCachePattern(attachment.answerId))
    }
    await this.setCache(this.getAttachmentCacheKey(attachment.id), attachment, this.ATTACHMENTS_TTL)
    return attachment
  }

  async createMany (attachmentsData: AnswerAttachmentProps[]): Promise<AnswerAttachment[]> {
    const attachments = await this.answerAttachmentsRepository.createMany(attachmentsData)
    const answerIdsToInvalidate = new Set<string>()
    for (const attachment of attachments) {
      if (attachment.answerId) {
        this.attachmentIdToAnswerId.set(attachment.id, attachment.answerId)
        answerIdsToInvalidate.add(attachment.answerId)
      }
    }
    await Promise.all(
      attachments
        .map(a => this.setCache(this.getAttachmentCacheKey(a.id), a, this.ATTACHMENTS_TTL))
        .concat(Array.from(answerIdsToInvalidate).map(id => {
          return this.invalidateCachePattern(this.getAttachmentsByAnswerCachePattern(id))
        }))
    )
    return attachments
  }

  async findById (attachmentId: string): Promise<AnswerAttachment | null> {
    const cacheKey = this.getAttachmentCacheKey(attachmentId)
    const cached = await this.getFromCache<AnswerAttachment>(cacheKey)
    if (cached && cached.answerId) this.attachmentIdToAnswerId.set(cached.id, cached.answerId)
    if (cached) return cached
    const attachment = await this.answerAttachmentsRepository.findById(attachmentId)
    if (attachment && attachment.answerId) this.attachmentIdToAnswerId.set(attachment.id, attachment.answerId)
    if (attachment) await this.setCache(cacheKey, attachment, this.ATTACHMENTS_TTL)
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

  async update (
    attachmentId: string,
    data: Partial<Pick<AnswerAttachment, 'title' | 'url'>>
  ): Promise<AnswerAttachment> {
    const attachment = await this.answerAttachmentsRepository.update(attachmentId, data)
    if (attachment.answerId) {
      this.attachmentIdToAnswerId.set(attachment.id, attachment.answerId)
      await this.invalidateCachePattern(this.getAttachmentsByAnswerCachePattern(attachment.answerId))
    }
    await this.setCache(this.getAttachmentCacheKey(attachment.id), attachment, this.ATTACHMENTS_TTL)
    return attachment
  }

  async delete (attachmentId: string): Promise<void> {
    const answerId = this.attachmentIdToAnswerId.get(attachmentId)
    await this.answerAttachmentsRepository.delete(attachmentId)
    await this.invalidateCache(this.getAttachmentCacheKey(attachmentId))
    if (answerId) {
      await this.invalidateCachePattern(this.getAttachmentsByAnswerCachePattern(answerId))
    }
    this.attachmentIdToAnswerId.delete(attachmentId)
  }

  async deleteMany (attachmentIds: string[]): Promise<void> {
    const answerIdsToInvalidate = new Set<string>()
    for (const id of attachmentIds) {
      const answerId = this.attachmentIdToAnswerId.get(id)
      if (answerId) {
        answerIdsToInvalidate.add(answerId)
        this.attachmentIdToAnswerId.delete(id)
      }
    }
    await Promise.all(
      [this.answerAttachmentsRepository.deleteMany(attachmentIds)]
        .concat(attachmentIds.map(id => this.invalidateCache(this.getAttachmentCacheKey(id))))
        .concat(Array.from(answerIdsToInvalidate).map(id => {
          return this.invalidateCachePattern(this.getAttachmentsByAnswerCachePattern(id))
        }))
    )
  }

  private getAttachmentCacheKey (id: string) {
    return `answer-attachment:${id}`
  }

  private getAttachmentsByAnswerCacheKey (answerId: string, page: number, size: number) {
    return `answer-attachments:answer:${answerId}:page:${page}:size:${size}`
  }

  private getAttachmentsByAnswerCachePattern (answerId: string) {
    return `answer-attachments:answer:${answerId}:*`
  }
}
