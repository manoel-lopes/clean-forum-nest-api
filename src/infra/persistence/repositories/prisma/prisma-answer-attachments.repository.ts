import { Inject, Injectable } from '@nestjs/common'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type {
  AnswerAttachmentsRepository,
  PaginatedAnswerAttachments,
} from '@/domain/application/repositories/answer-attachments.repository'
import { PrismaAnswerAttachmentMapper } from '@/infra/persistence/mappers/prisma/prisma-answer-attachment.mapper'
import { PrismaService } from '@/infra/persistence/prisma.service'
import type { AnswerAttachment } from '@/domain/enterprise/entities/answer-attachment.entity'
import { BasePrismaAttachmentsRepository } from './base/base-prisma-attachments.repository'

@Injectable()
export class PrismaAnswerAttachmentsRepository
  extends BasePrismaAttachmentsRepository<AnswerAttachment>
  implements AnswerAttachmentsRepository {
  protected readonly foreignKey = 'answerId' as const

  constructor (
    prisma: PrismaService,
    @Inject(PrismaAnswerAttachmentMapper) mapper: typeof PrismaAnswerAttachmentMapper
  ) {
    super(prisma, mapper)
  }

  async findManyByAnswerId (answerId: string, params: PaginationParams): Promise<PaginatedAnswerAttachments> {
    return this.findManyByForeignKey(answerId, params)
  }
}
