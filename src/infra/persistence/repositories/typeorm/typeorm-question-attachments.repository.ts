import { EntityManager, In } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type {
  PaginatedQuestionAttachments,
  QuestionAttachmentsRepository,
} from '@/domain/application/repositories/question-attachments.repository'
import { TypeOrmAttachmentMapper } from '@/infra/persistence/mappers/typeorm/typeorm-attachment.mapper'
import { Attachment } from '@/domain/enterprise/entities/base/attachment.entity'
import { BaseTypeOrmRepository } from './base/base-typeorm.repository'

@Injectable()
export class TypeOrmQuestionAttachmentsRepository
  extends BaseTypeOrmRepository<Attachment>
  implements QuestionAttachmentsRepository {
  constructor (
    @InjectEntityManager()
    manager: EntityManager
  ) {
    super(Attachment, manager)
  }

  async save (attachment: Attachment): Promise<Attachment> {
    const saved = await this.repository.save(attachment)
    return TypeOrmAttachmentMapper.toDomain(saved)
  }

  async saveMany (attachments: Attachment[]): Promise<Attachment[]> {
    if (attachments.length === 0) return []
    const saved = await this.repository.save(attachments)
    return saved.map(TypeOrmAttachmentMapper.toDomain)
  }

  async findById (attachmentId: string): Promise<Attachment | null> {
    const attachment = await this.repository.findOne({ where: { id: attachmentId } })
    if (!attachment || !attachment.questionId) return null
    return TypeOrmAttachmentMapper.toDomain(attachment)
  }

  async findManyByQuestionId (
    questionId: string,
    { page = 1, pageSize = 10, order = 'desc' }: PaginationParams
  ): Promise<PaginatedQuestionAttachments> {
    const pagination = this.sanitizePagination(page, pageSize)
    const [attachmentsList, totalItems] = await this.repository.findAndCount({
      where: { questionId },
      order: { createdAt: order === 'desc' ? 'DESC' : 'ASC' },
      skip: pagination.offset,
      take: pagination.limit,
    })
    return {
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pagination.pageSize),
      order,
      items: attachmentsList.map(TypeOrmAttachmentMapper.toDomain),
    }
  }

  async update (attachmentId: string, data: Partial<Pick<Attachment, 'title' | 'url'>>): Promise<Attachment> {
    const updated = await this.repository.save({ id: attachmentId, ...data })
    return TypeOrmAttachmentMapper.toDomain(updated)
  }

  override async delete (attachmentId: string): Promise<void> {
    await this.repository.delete(attachmentId)
  }

  async deleteMany (attachmentIds: string[]): Promise<void> {
    if (attachmentIds.length === 0) return
    await this.repository.delete({ id: In(attachmentIds) })
  }
}
