import { Inject, Injectable } from '@nestjs/common'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type {
  AnswerCommentsRepository,
  PaginatedAnswerComments,
} from '@/domain/application/repositories/answer-comments.repository'
import { PrismaAnswerCommentMapper } from '@/infra/persistence/mappers/prisma/prisma-answer-comment.mapper'
import { PrismaService } from '@/infra/persistence/prisma.service'
import type { AnswerComment } from '@/domain/enterprise/entities/answer-comment.entity'
import { BasePrismaCommentsRepository } from './base/base-prisma-comments.repository'

@Injectable()
export class PrismaAnswerCommentsRepository
  extends BasePrismaCommentsRepository<AnswerComment>
  implements AnswerCommentsRepository {
  protected readonly foreignKey = 'answerId' as const

  constructor (
    prisma: PrismaService,
    @Inject(PrismaAnswerCommentMapper) mapper: typeof PrismaAnswerCommentMapper
  ) {
    super(prisma, mapper)
  }

  async findManyByAnswerId (answerId: string, params: PaginationParams): Promise<PaginatedAnswerComments> {
    return this.findManyByForeignKey(answerId, params)
  }
}
