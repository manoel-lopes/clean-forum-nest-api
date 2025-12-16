import { EntityManager, In } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type {
  PaginatedQuestionAttachments,
  QuestionAttachmentsRepository,
} from '@/domain/application/repositories/question-attachments.repository'
import { AttachmentEntity } from '@/infra/persistence/typeorm/entities/attachment.entity'
import type { QuestionAttachment, QuestionAttachmentProps } from '@/domain/enterprise/entities/question-attachment.entity'
import { BaseTypeOrmRepository } from './base/base-typeorm.repository'

@Injectable()
export class TypeOrmQuestionAttachmentsRepository
  extends BaseTypeOrmRepository<AttachmentEntity>
  implements QuestionAttachmentsRepository {
  constructor (
    @InjectEntityManager()
    manager: EntityManager
  ) {
    super(AttachmentEntity, manager)
  }

  async create (data: QuestionAttachmentProps): Promise<QuestionAttachment> {
    const entity = this.repository.create({ ...data, link: data.url, answerId: null })
    const saved = await this.repository.save(entity)
    return this.toDomain(saved)
  }

  async createMany (data: QuestionAttachmentProps[]): Promise<QuestionAttachment[]> {
    if (data.length === 0) return []
    const entities = data.map(d => this.repository.create({ ...d, link: d.url, answerId: null }))
    const saved = await this.repository.save(entities)
    return saved.map(e => this.toDomain(e))
  }

  async findById (attachmentId: string): Promise<QuestionAttachment | null> {
    const entity = await this.repository.findOne({ where: { id: attachmentId } })
    if (!entity || !entity.questionId) return null
    return this.toDomain(entity)
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
      items: attachmentsList.map(a => this.toDomain(a)),
    }
  }

  async update (attachmentId: string, data: Partial<Pick<QuestionAttachment, 'title' | 'url'>>): Promise<QuestionAttachment> {
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

  private toDomain (entity: AttachmentEntity): QuestionAttachment {
    return {
      id: entity.id,
      title: entity.title,
      url: entity.link,
      questionId: entity.questionId!,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt ?? entity.createdAt,
    }
  }
}
