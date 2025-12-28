import { Inject, Injectable } from '@nestjs/common'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type {
  PaginatedQuestionComments,
  QuestionCommentsRepository,
} from '@/domain/application/repositories/question-comments.repository'
import { PrismaQuestionCommentMapper } from '@/infra/persistence/mappers/prisma/prisma-question-comment.mapper'
import { PrismaService } from '@/infra/persistence/prisma.service'
import type { QuestionComment } from '@/domain/enterprise/entities/question-comment.entity'
import { BasePrismaCommentsRepository } from './base/base-prisma-comments.repository'

@Injectable()
export class PrismaQuestionCommentsRepository
  extends BasePrismaCommentsRepository<QuestionComment>
  implements QuestionCommentsRepository {
  protected readonly foreignKey = 'questionId' as const

  constructor (
    prisma: PrismaService,
    @Inject(PrismaQuestionCommentMapper) mapper: typeof PrismaQuestionCommentMapper
  ) {
    super(prisma, mapper)
  }

  async findManyByQuestionId (questionId: string, params: PaginationParams): Promise<PaginatedQuestionComments> {
    return this.findManyByForeignKey(questionId, params)
  }
}
