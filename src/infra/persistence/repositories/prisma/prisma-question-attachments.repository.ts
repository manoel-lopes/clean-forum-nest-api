import { Injectable } from '@nestjs/common'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type {
  PaginatedQuestionAttachments,
  QuestionAttachmentsRepository,
} from '@/domain/application/repositories/question-attachments.repository'
import { PrismaQuestionAttachmentMapper } from '@/infra/persistence/mappers/prisma/prisma-question-attachment.mapper'
import { PrismaService } from '@/infra/persistence/prisma.service'
import type {
  QuestionAttachment,
  QuestionAttachmentProps,
} from '@/domain/enterprise/entities/question-attachment.entity'

@Injectable()
export class PrismaQuestionAttachmentsRepository implements QuestionAttachmentsRepository {
  constructor (private readonly prisma: PrismaService) {}

  async create (data: QuestionAttachmentProps): Promise<QuestionAttachment> {
    const { url, ...rest } = data
    const attachment = await this.prisma.attachment.create({ data: { ...rest, link: url } })
    return PrismaQuestionAttachmentMapper.toDomain(attachment)
  }

  async createMany (attachments: QuestionAttachmentProps[]): Promise<QuestionAttachment[]> {
    const mappedData = attachments.map(({ url, ...rest }) => ({ ...rest, link: url }))
    const created = await this.prisma.attachment.createManyAndReturn({ data: mappedData })
    return created.map((attachment) => PrismaQuestionAttachmentMapper.toDomain(attachment))
  }

  async findById (attachmentId: string): Promise<QuestionAttachment | null> {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id: attachmentId },
    })
    if (!attachment || !attachment.questionId) return null
    return PrismaQuestionAttachmentMapper.toDomain(attachment)
  }

  async findManyByQuestionId (questionId: string, params: PaginationParams): Promise<PaginatedQuestionAttachments> {
    const { page = 1, pageSize = 10, order = 'desc' } = params
    const [attachments, totalItems] = await this.prisma.$transaction([
      this.prisma.attachment.findMany({
        where: { questionId },
        orderBy: { createdAt: order },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.attachment.count({ where: { questionId } }),
    ])
    return {
      page,
      pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
      items: attachments.map((attachment) => {
        return PrismaQuestionAttachmentMapper.toDomain(attachment)
      }),
      order,
    }
  }

  async update (
    attachmentId: string,
    data: Partial<Pick<QuestionAttachment, 'title' | 'url'>>
  ): Promise<QuestionAttachment> {
    const { url, ...rest } = data
    const updateData = url ? { ...rest, link: url } : rest
    const updatedAttachment = await this.prisma.attachment.update({
      where: { id: attachmentId },
      data: updateData,
    })
    return PrismaQuestionAttachmentMapper.toDomain(updatedAttachment)
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
