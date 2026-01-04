import { Inject, Injectable } from '@nestjs/common'
import type { PaginationParams } from '@/core/domain/pagination-params'
import type { UpdateAttachmentData } from '@/domain/application/repositories/base/attachments.repository'
import type {
  PaginatedQuestionAttachments,
  QuestionAttachmentsRepository,
} from '@/domain/application/repositories/question-attachments.repository'
import { RedisCacheService } from '@/infra/cache/redis-cache.service'
import type { QuestionAttachment } from '@/domain/enterprise/entities/question-attachment/question-attachment.entity'
import { BaseCachedRepository } from './base/base-cached.repository'

export const TypeOrmQuestionAttachmentsRepositoryToken = Symbol('TypeOrmQuestionAttachmentsRepositoryToken')

@Injectable()
export class CachedQuestionAttachmentsRepository
  extends BaseCachedRepository
  implements QuestionAttachmentsRepository {
  private readonly ATTACHMENT_TTL = 60 * 60
  private readonly ATTACHMENTS_LIST_TTL = 10 * 60
  private readonly attachmentIdToQuestionId = new Map<string, string>()

  constructor (
    protected readonly cacheService: RedisCacheService,
    @Inject(TypeOrmQuestionAttachmentsRepositoryToken)
    private readonly questionAttachmentsRepository: QuestionAttachmentsRepository
  ) {
    super(cacheService)
  }

  async save (attachment: QuestionAttachment): Promise<void> {
    await this.questionAttachmentsRepository.save(attachment)
    this.attachmentIdToQuestionId.set(attachment.id, attachment.questionId)
    await Promise.all([
      this.setCache(this.getAttachmentCacheKey(attachment.id), attachment, this.ATTACHMENT_TTL),
      this.invalidateCachePattern(this.getAttachmentsByQuestionCachePattern(attachment.questionId)),
    ])
  }

  async saveMany (attachments: QuestionAttachment[]): Promise<void> {
    await this.questionAttachmentsRepository.saveMany(attachments)
    const questionIdsToInvalidate = new Set<string>()
    for (const attachment of attachments) {
      this.attachmentIdToQuestionId.set(attachment.id, attachment.questionId)
      questionIdsToInvalidate.add(attachment.questionId)
    }
    await Promise.all([
      ...attachments.map(attachment =>
        this.setCache(this.getAttachmentCacheKey(attachment.id), attachment, this.ATTACHMENT_TTL)
      ),
      ...Array.from(questionIdsToInvalidate, questionId =>
        this.invalidateCachePattern(this.getAttachmentsByQuestionCachePattern(questionId))
      ),
    ])
  }

  async findById (attachmentId: string): Promise<QuestionAttachment | null> {
    const cacheKey = this.getAttachmentCacheKey(attachmentId)
    const cached = await this.getFromCache<QuestionAttachment>(cacheKey)
    if (cached) {
      this.attachmentIdToQuestionId.set(cached.id, cached.questionId)
      return cached
    }
    const attachment = await this.questionAttachmentsRepository.findById(attachmentId)
    if (attachment) {
      this.attachmentIdToQuestionId.set(attachment.id, attachment.questionId)
      await this.setCache(cacheKey, attachment, this.ATTACHMENT_TTL)
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

  async update (attachmentId: string, data: UpdateAttachmentData): Promise<QuestionAttachment> {
    const attachment = await this.questionAttachmentsRepository.update(attachmentId, data)
    this.attachmentIdToQuestionId.set(attachment.id, attachment.questionId)
    await Promise.all([
      this.setCache(this.getAttachmentCacheKey(attachment.id), attachment, this.ATTACHMENT_TTL),
      this.invalidateCachePattern(this.getAttachmentsByQuestionCachePattern(attachment.questionId)),
    ])
    return attachment
  }

  async delete (attachmentId: string | string[]): Promise<void> {
    const ids = Array.isArray(attachmentId) ? attachmentId : [attachmentId]
    const questionIdsToInvalidate = new Set<string>()
    for (const id of ids) {
      const questionId = this.attachmentIdToQuestionId.get(id)
      if (questionId) {
        questionIdsToInvalidate.add(questionId)
        this.attachmentIdToQuestionId.delete(id)
      }
    }
    await Promise.all([
      this.questionAttachmentsRepository.delete(attachmentId),
      ...ids.map(id => this.invalidateCache(this.getAttachmentCacheKey(id))),
      ...Array.from(questionIdsToInvalidate, questionId =>
        this.invalidateCachePattern(this.getAttachmentsByQuestionCachePattern(questionId))
      ),
    ])
  }

  private getAttachmentCacheKey (id: string): string {
    return `question-attachment:${id}`
  }

  private getAttachmentsByQuestionCacheKey (questionId: string, page: number, size: number): string {
    return `question-attachments:question:${questionId}:page:${page}:size:${size}`
  }

  private getAttachmentsByQuestionCachePattern (questionId: string): string {
    return `question-attachments:question:${questionId}:*`
  }
}
