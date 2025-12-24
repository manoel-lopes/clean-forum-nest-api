import type { PaginatedItems } from '@/core/domain/application/paginated-items'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type { PrismaService } from '@/infra/persistence/prisma.service'
import type { AttachmentMapperClass } from '@/infra/persistence/mappers/ports/attachment-mapper'
import type { Attachment, AttachmentProps } from '@/domain/enterprise/entities/base/attachment.entity'

export type AttachmentForeignKey = 'questionId' | 'answerId'

export abstract class BasePrismaAttachmentsRepository<TAttachment extends Attachment> {
  protected abstract readonly foreignKey: AttachmentForeignKey

  constructor (
    protected readonly prisma: PrismaService,
    protected readonly mapper: AttachmentMapperClass<TAttachment>
  ) {}

  async create (data: AttachmentProps): Promise<TAttachment> {
    const attachment = await this.prisma.attachment.create({ data })
    return this.mapper.toDomain(attachment)
  }

  async createMany (attachmentsData: AttachmentProps[]): Promise<TAttachment[]> {
    const created = await this.prisma.attachment.createManyAndReturn({ data: attachmentsData })
    return created.map((attachment) => this.mapper.toDomain(attachment))
  }

  async findById (attachmentId: string): Promise<TAttachment | null> {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id: attachmentId },
    })
    if (!attachment || !attachment[this.foreignKey]) return null
    return this.mapper.toDomain(attachment)
  }

  async update (
    attachmentId: string,
    data: Partial<Pick<Attachment, 'title' | 'url'>>
  ): Promise<TAttachment> {
    const updatedAttachment = await this.prisma.attachment.update({
      where: { id: attachmentId },
      data,
    })
    return this.mapper.toDomain(updatedAttachment)
  }

  async delete (attachmentId: string): Promise<void> {
    await this.prisma.attachment.delete({ where: { id: attachmentId } })
  }

  async deleteMany (attachmentIds: string[]): Promise<void> {
    await this.prisma.attachment.deleteMany({
      where: { id: { in: attachmentIds } },
    })
  }

  protected async findManyByForeignKey (
    foreignKeyValue: string,
    params: PaginationParams
  ): Promise<PaginatedItems<TAttachment>> {
    const { page = 1, pageSize = 10, order = 'desc' } = params
    const where = { [this.foreignKey]: foreignKeyValue }
    const [attachments, totalItems] = await Promise.all([
      this.prisma.attachment.findMany({
        where,
        orderBy: { createdAt: order },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.attachment.count({ where }),
    ])
    return {
      page,
      pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
      items: attachments.map((attachment) => this.mapper.toDomain(attachment)),
      order,
    }
  }
}
