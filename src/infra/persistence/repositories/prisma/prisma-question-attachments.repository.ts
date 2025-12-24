import { Inject, Injectable } from '@nestjs/common'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type {
  PaginatedQuestionAttachments,
  QuestionAttachmentsRepository,
} from '@/domain/application/repositories/question-attachments.repository'
import { PrismaQuestionAttachmentMapper } from '@/infra/persistence/mappers/prisma/prisma-question-attachment.mapper'
import { PrismaService } from '@/infra/persistence/prisma.service'
import type { QuestionAttachment } from '@/domain/enterprise/entities/question-attachment.entity'
import { BasePrismaAttachmentsRepository } from './base/base-prisma-attachments.repository'

@Injectable()
export class PrismaQuestionAttachmentsRepository
  extends BasePrismaAttachmentsRepository<QuestionAttachment>
  implements QuestionAttachmentsRepository {
  protected readonly foreignKey = 'questionId' as const

  constructor (
    prisma: PrismaService,
    @Inject(PrismaQuestionAttachmentMapper) mapper: typeof PrismaQuestionAttachmentMapper
  ) {
    super(prisma, mapper)
  }

  async findManyByQuestionId (questionId: string, params: PaginationParams): Promise<PaginatedQuestionAttachments> {
    return this.findManyByForeignKey(questionId, params)
  }
}
