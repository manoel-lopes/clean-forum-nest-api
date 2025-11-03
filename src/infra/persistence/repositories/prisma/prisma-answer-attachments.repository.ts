import { Injectable } from '@nestjs/common'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type {
  AnswerAttachmentsRepository,
  PaginatedAnswerAttachments,
} from '@/domain/application/repositories/answer-attachments.repository'
import { PrismaAnswerAttachmentMapper } from '@/infra/persistence/mappers/prisma/prisma-answer-attachment.mapper'
import { PrismaService } from '@/infra/persistence/prisma.service'
import type { AnswerAttachment, AnswerAttachmentProps } from '@/domain/enterprise/entities/answer-attachment.entity'

@Injectable()
export class PrismaAnswerAttachmentsRepository implements AnswerAttachmentsRepository {
  constructor (private readonly prisma: PrismaService) {}

  async create (data: AnswerAttachmentProps): Promise<AnswerAttachment> {
    const { url, ...rest } = data
    const attachment = await this.prisma.attachment.create({ data: { ...rest, link: url } })
    return PrismaAnswerAttachmentMapper.toDomain(attachment)
  }

  async createMany (attachments: AnswerAttachmentProps[]): Promise<AnswerAttachment[]> {
    const mappedData = attachments.map(({ url, ...rest }) => ({ ...rest, link: url }))
    const created = await this.prisma.attachment.createManyAndReturn({ data: mappedData })
    return created.map((attachment) => PrismaAnswerAttachmentMapper.toDomain(attachment))
  }

  async findById (attachmentId: string): Promise<AnswerAttachment | null> {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id: attachmentId },
    })
    if (!attachment || !attachment.answerId) return null
    return PrismaAnswerAttachmentMapper.toDomain(attachment)
  }

  async findManyByAnswerId (answerId: string, params: PaginationParams): Promise<PaginatedAnswerAttachments> {
    const { page = 1, pageSize = 10, order = 'desc' } = params
    const [attachments, totalItems] = await this.prisma.$transaction([
      this.prisma.attachment.findMany({
        where: { answerId },
        orderBy: { createdAt: order },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.attachment.count({ where: { answerId } }),
    ])
    return {
      page,
      pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
      items: attachments.map((attachment) => PrismaAnswerAttachmentMapper.toDomain(attachment)),
      order,
    }
  }

  async update (
    attachmentId: string,
    data: Partial<Pick<AnswerAttachment, 'title' | 'url'>>
  ): Promise<AnswerAttachment> {
    const { url, ...rest } = data
    const updateData = url ? { ...rest, link: url } : rest
    const updatedAttachment = await this.prisma.attachment.update({
      where: { id: attachmentId },
      data: updateData,
    })
    return PrismaAnswerAttachmentMapper.toDomain(updatedAttachment)
  }

  async delete (attachmentId: string): Promise<void> {
    await this.prisma.attachment.delete({ where: { id: attachmentId } })
  }

  async deleteMany (attachmentIds: string[]): Promise<void> {
    await this.prisma.attachment.deleteMany({
      where: { id: { in: attachmentIds } },
    })
  }
}
