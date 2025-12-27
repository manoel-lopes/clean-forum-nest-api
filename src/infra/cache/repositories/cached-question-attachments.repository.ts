import { Inject, Injectable } from '@nestjs/common'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type {
  PaginatedQuestionAttachments,
  QuestionAttachmentsRepository,
} from '@/domain/application/repositories/question-attachments.repository'
import { CacheTTL } from '@/infra/cache/cache-ttl'
import { RedisCacheService } from '@/infra/cache/redis-cache.service'
import type {
  QuestionAttachment,
  QuestionAttachmentProps,
} from '@/domain/enterprise/entities/question-attachment.entity'
import { BaseCachedRepository } from './base/base-cached.repository'

export const PrismaQuestionAttachmentsRepositoryToken = Symbol('PrismaQuestionAttachmentsRepositoryToken')

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
    @Inject(PrismaQuestionAttachmentsRepositoryToken)
    private readonly questionAttachmentsRepository: QuestionAttachmentsRepository
  ) {
    super(cacheService)
  }

  async create (attachment: QuestionAttachmentProps): Promise<QuestionAttachment> {
    const createdAttachment = await this.questionAttachmentsRepository.create(attachment)
    await this.setCache(
      this.cacheKeys.questionAttachment(createdAttachment.id),
      createdAttachment,
      CacheTTL.ATTACHMENT
    )
    if (createdAttachment.questionId) {
      await this.invalidateCachePattern(
        this.cacheKeys.questionAttachmentsByQuestionPattern(createdAttachment.questionId)
      )
    }
    return createdAttachment
  }

  async createMany (attachments: QuestionAttachmentProps[]): Promise<QuestionAttachment[]> {
    const createdAttachments = await this.questionAttachmentsRepository.createMany(attachments)
    for (const attachment of createdAttachments) {
      await this.setCache(this.cacheKeys.questionAttachment(attachment.id), attachment, CacheTTL.ATTACHMENT)
      if (attachment.questionId) {
        await this.invalidateCachePattern(this.cacheKeys.questionAttachmentsByQuestionPattern(attachment.questionId))
      }
    }
    return createdAttachments
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
    await this.setCache(cacheKey, attachments, CacheTTL.ATTACHMENTS_LIST)
    return attachments
  }

  async update (
    attachmentId: string,
    data: Partial<Pick<QuestionAttachment, 'title' | 'url'>>
  ): Promise<QuestionAttachment> {
    const attachment = await this.questionAttachmentsRepository.update(attachmentId, data)
    await this.setCache(this.cacheKeys.questionAttachment(attachment.id), attachment, CacheTTL.ATTACHMENT)
    if (attachment.questionId) {
      await this.invalidateCachePattern(this.cacheKeys.questionAttachmentsByQuestionPattern(attachment.questionId))
    }
    return attachment
  }

  async delete (attachmentId: string): Promise<void> {
    const attachment = await this.questionAttachmentsRepository.findById(attachmentId)
    await this.questionAttachmentsRepository.delete(attachmentId)
    await this.invalidateCache(this.cacheKeys.questionAttachment(attachmentId))
    if (attachment?.questionId) {
      await this.invalidateCachePattern(this.cacheKeys.questionAttachmentsByQuestionPattern(attachment.questionId))
    }
  }

  async deleteMany (attachmentIds: string[]): Promise<void> {
    for (const id of attachmentIds) {
      const attachment = await this.questionAttachmentsRepository.findById(id)
      if (attachment?.questionId) {
        await this.invalidateCache(this.cacheKeys.questionAttachment(id))
        await this.invalidateCachePattern(
          this.cacheKeys.questionAttachmentsByQuestionPattern(attachment.questionId)
        )
      }
    }
    await this.questionAttachmentsRepository.deleteMany(attachmentIds)
  }
}
