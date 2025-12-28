import { Inject, Injectable } from '@nestjs/common'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import {
  PaginatedQuestionAttachments,
  QuestionAttachmentsRepository,
} from '@/domain/application/repositories/question-attachments.repository'
import { RedisCacheService } from '@/infra/persistence/repositories/cache/redis-cache.service'
import type {
  QuestionAttachment,
  QuestionAttachmentProps,
} from '@/domain/enterprise/entities/question-attachment.entity'
import { BaseCachedRepository } from './base/base-cached.repository'

@Injectable()
export class CachedQuestionAttachmentsRepository
  extends BaseCachedRepository
  implements QuestionAttachmentsRepository {
  private readonly ATTACHMENTS_TTL = 3600
  private readonly ATTACHMENTS_LIST_TTL = 1800
  private readonly attachmentIdToQuestionId = new Map<string, string>()

  constructor (
    protected readonly redis: RedisCacheService,
    @Inject(QuestionAttachmentsRepository)
    private readonly questionAttachmentsRepository: QuestionAttachmentsRepository
  ) {
    super(redis)
  }

  async create (attachmentData: QuestionAttachmentProps): Promise<QuestionAttachment> {
    const attachment = await this.questionAttachmentsRepository.create(attachmentData)
    if (attachment.questionId) {
      this.attachmentIdToQuestionId.set(attachment.id, attachment.questionId)
      await this.invalidateCachePattern(
        this.getAttachmentsByQuestionCachePattern(attachment.questionId)
      )
    }
    await this.setCache(
      this.getAttachmentCacheKey(attachment.id),
      attachment,
      this.ATTACHMENTS_TTL
    )
    return attachment
  }

  async createMany (attachmentsData: QuestionAttachmentProps[]): Promise<QuestionAttachment[]> {
    const attachments = await this.questionAttachmentsRepository.createMany(attachmentsData)
    const questionIdsToInvalidate = new Set<string>()
    for (const attachment of attachments) {
      if (attachment.questionId) {
        this.attachmentIdToQuestionId.set(attachment.id, attachment.questionId)
        questionIdsToInvalidate.add(attachment.questionId)
      }
    }
    await Promise.all(
      attachments
        .map(attachment => this.setCache(
          this.getAttachmentCacheKey(attachment.id),
          attachment,
          this.ATTACHMENTS_TTL))
        .concat(Array.from(questionIdsToInvalidate, id => {
          return this.invalidateCachePattern(this.getAttachmentsByQuestionCachePattern(id))
        }))
    )
    return attachments
  }

  async findById (attachmentId: string): Promise<QuestionAttachment | null> {
    const cacheKey = this.getAttachmentCacheKey(attachmentId)
    const cached = await this.getFromCache<QuestionAttachment>(cacheKey)
    if (cached && cached.questionId) this.attachmentIdToQuestionId.set(cached.id, cached.questionId)
    if (cached) return cached
    const attachment = await this.questionAttachmentsRepository.findById(attachmentId)
    if (attachment && attachment.questionId) {
      this.attachmentIdToQuestionId.set(attachment.id, attachment.questionId)
      await this.setCache(cacheKey, attachment, this.ATTACHMENTS_TTL)
    }
    return attachment
  }

  async findManyByQuestionId (
    questionId: string,
    params: PaginationParams
  ): Promise<PaginatedQuestionAttachments> {
    const { page = 1, pageSize = 10 } = params
    const cacheKey = this.getAttachmentsByQuestionCacheKey(questionId, page, pageSize)
    const cached = await this.getFromCache<PaginatedQuestionAttachments>(cacheKey)
    if (cached) return cached
    const attachments = await this.questionAttachmentsRepository.findManyByQuestionId(questionId, params)
    await this.setCache(cacheKey, attachments, this.ATTACHMENTS_LIST_TTL)
    return attachments
  }

  async update (
    attachmentId: string,
    data: Partial<Pick<QuestionAttachment, 'title' | 'url'>>
  ): Promise<QuestionAttachment> {
    const attachment = await this.questionAttachmentsRepository.update(attachmentId, data)
    if (attachment.questionId) {
      this.attachmentIdToQuestionId.set(attachment.id, attachment.questionId)
      await this.invalidateCachePattern(this.getAttachmentsByQuestionCachePattern(attachment.questionId))
    }
    await this.setCache(this.getAttachmentCacheKey(attachment.id), attachment, this.ATTACHMENTS_TTL)
    return attachment
  }

  async delete (attachmentId: string): Promise<void> {
    const questionId = this.attachmentIdToQuestionId.get(attachmentId)
    await this.questionAttachmentsRepository.delete(attachmentId)
    await this.invalidateCache(this.getAttachmentCacheKey(attachmentId))
    if (questionId) {
      await this.invalidateCachePattern(this.getAttachmentsByQuestionCachePattern(questionId))
    }
    this.attachmentIdToQuestionId.delete(attachmentId)
  }

  async deleteMany (attachmentIds: string[]): Promise<void> {
    const questionIdsToInvalidate = new Set<string>()
    for (const id of attachmentIds) {
      const questionId = this.attachmentIdToQuestionId.get(id)
      if (questionId) {
        questionIdsToInvalidate.add(questionId)
        this.attachmentIdToQuestionId.delete(id)
      }
    }
    await Promise.all(
      [this.questionAttachmentsRepository.deleteMany(attachmentIds)]
        .concat(attachmentIds.map(id => this.invalidateCache(this.getAttachmentCacheKey(id))))
        .concat(Array.from(questionIdsToInvalidate, id => {
          return this.invalidateCachePattern(this.getAttachmentsByQuestionCachePattern(id))
        }))
    )
  }

  private getAttachmentCacheKey (id: string) {
    return `question-attachment:${id}`
  }

  private getAttachmentsByQuestionCacheKey (questionId: string, page: number, size: number) {
    return `question-attachments:question:${questionId}:page:${page}:size:${size}`
  }

  private getAttachmentsByQuestionCachePattern (questionId: string) {
    return `question-attachments:question:${questionId}:*`
  }
}
