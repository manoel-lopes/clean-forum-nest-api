import { EntityManager, In } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type {
  AnswerAttachmentsRepository,
  PaginatedAnswerAttachments,
} from '@/domain/application/repositories/answer-attachments.repository'
import { AttachmentEntity } from '@/infra/persistence/typeorm/entities/attachment.entity'
import type { AnswerAttachment, AnswerAttachmentProps } from '@/domain/enterprise/entities/answer-attachment.entity'
import { BaseTypeOrmRepository } from './base/base-typeorm.repository'

@Injectable()
export class TypeOrmAnswerAttachmentsRepository
  extends BaseTypeOrmRepository<AttachmentEntity>
  implements AnswerAttachmentsRepository {
  constructor (
    @InjectEntityManager()
    manager: EntityManager
  ) {
    super(AttachmentEntity, manager)
  }

  async create (data: AnswerAttachmentProps): Promise<AnswerAttachment> {
    const entity = this.repository.create({ ...data, link: data.url, questionId: null })
    const saved = await this.repository.save(entity)
    return this.toDomain(saved)
  }

  async createMany (data: AnswerAttachmentProps[]): Promise<AnswerAttachment[]> {
    if (data.length === 0) return []
    const entities = data.map(d => this.repository.create({ ...d, link: d.url, questionId: null }))
    const saved = await this.repository.save(entities)
    return saved.map(e => this.toDomain(e))
  }

  async findById (attachmentId: string): Promise<AnswerAttachment | null> {
    const entity = await this.repository.findOne({ where: { id: attachmentId } })
    if (!entity || !entity.answerId) return null
    return this.toDomain(entity)
  }

  async findManyByAnswerId (
    answerId: string,
    { page = 1, pageSize = 10, order = 'desc' }: PaginationParams
  ): Promise<PaginatedAnswerAttachments> {
    const pagination = this.sanitizePagination(page, pageSize)
    const [attachmentsList, totalItems] = await this.repository.findAndCount({
      where: { answerId },
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
      items: attachmentsList.map(a => this.toDomain(a)),
    }
  }

  async update (attachmentId: string, data: Partial<Pick<AnswerAttachment, 'title' | 'url'>>): Promise<AnswerAttachment> {
    const updateData: Partial<AttachmentEntity> = {}
    if (data.title) updateData.title = data.title
    if (data.url) updateData.link = data.url
    await this.repository.update(attachmentId, updateData)
    const updated = await this.repository.findOneOrFail({ where: { id: attachmentId } })
    return this.toDomain(updated)
  }

  override async delete (attachmentId: string): Promise<void> {
    await this.repository.delete(attachmentId)
  }

  async deleteMany (attachmentIds: string[]): Promise<void> {
    if (attachmentIds.length === 0) return
    await this.repository.delete({ id: In(attachmentIds) })
  }

  private toDomain (entity: AttachmentEntity): AnswerAttachment {
    return {
      id: entity.id,
      title: entity.title,
      url: entity.link,
      answerId: entity.answerId!,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt ?? entity.createdAt,
    }
  }
}
