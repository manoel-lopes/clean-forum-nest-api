import { Inject, Injectable } from '@nestjs/common'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type {
  AnswerAttachmentsRepository,
  PaginatedAnswerAttachments,
} from '@/domain/application/repositories/answer-attachments.repository'
import { CacheTTL } from '@/infra/cache/cache-ttl'
import { RedisCacheService } from '@/infra/cache/redis-cache.service'
import type { AnswerAttachment, AnswerAttachmentProps } from '@/domain/enterprise/entities/answer-attachment.entity'
import { BaseCachedRepository } from './base/base-cached.repository'

export const PrismaAnswerAttachmentsRepositoryToken = Symbol('PrismaAnswerAttachmentsRepositoryToken')

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
    @Inject(PrismaAnswerAttachmentsRepositoryToken)
    private readonly answerAttachmentsRepository: AnswerAttachmentsRepository
  ) {
    super(cacheService)
  }

  async create (attachment: AnswerAttachmentProps): Promise<AnswerAttachment> {
    const createdAttachment = await this.answerAttachmentsRepository.create(attachment)
    await this.setCache(this.cacheKeys.answerAttachment(createdAttachment.id), createdAttachment, CacheTTL.ATTACHMENT)
    if (createdAttachment.answerId) {
      await this.invalidateCachePattern(this.cacheKeys.answerAttachmentsByAnswerPattern(createdAttachment.answerId))
    }
    return createdAttachment
  }

  async createMany (attachments: AnswerAttachmentProps[]): Promise<AnswerAttachment[]> {
    const createdAttachments = await this.answerAttachmentsRepository.createMany(attachments)
    for (const attachment of createdAttachments) {
      await this.setCache(this.cacheKeys.answerAttachment(attachment.id), attachment, CacheTTL.ATTACHMENT)
      if (attachment.answerId) {
        await this.invalidateCachePattern(this.cacheKeys.answerAttachmentsByAnswerPattern(attachment.answerId))
      }
    }
    return createdAttachments
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
    await this.setCache(cacheKey, attachments, CacheTTL.ATTACHMENTS_LIST)
    return attachments
  }

  async update (
    attachmentId: string,
    data: Partial<Pick<AnswerAttachment, 'title' | 'url'>>
  ): Promise<AnswerAttachment> {
    const attachment = await this.answerAttachmentsRepository.update(attachmentId, data)
    await this.setCache(this.cacheKeys.answerAttachment(attachment.id), attachment, CacheTTL.ATTACHMENT)
    if (attachment.answerId) {
      await this.invalidateCachePattern(this.cacheKeys.answerAttachmentsByAnswerPattern(attachment.answerId))
    }
    return attachment
  }

  async delete (attachmentId: string): Promise<void> {
    const attachment = await this.answerAttachmentsRepository.findById(attachmentId)
    await this.answerAttachmentsRepository.delete(attachmentId)
    await this.invalidateCache(this.cacheKeys.answerAttachment(attachmentId))
    if (attachment?.answerId) {
      await this.invalidateCachePattern(this.cacheKeys.answerAttachmentsByAnswerPattern(attachment.answerId))
    }
  }

  async deleteMany (attachmentIds: string[]): Promise<void> {
    for (const id of attachmentIds) {
      const attachment = await this.answerAttachmentsRepository.findById(id)
      if (attachment?.answerId) {
        await this.invalidateCache(this.cacheKeys.answerAttachment(id))
        await this.invalidateCachePattern(this.cacheKeys.answerAttachmentsByAnswerPattern(attachment.answerId))
      }
    }
    await this.answerAttachmentsRepository.deleteMany(attachmentIds)
  }
}
