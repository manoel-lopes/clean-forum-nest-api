import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type {
  AnswerCommentsRepository,
  PaginatedAnswerComments,
} from '@/domain/application/repositories/answer-comments.repository'
import type { UpdateCommentData } from '@/domain/application/repositories/base/comments.repository'
import { AnswerComment } from '@/domain/enterprise/entities/answer-comment.entity'
import { BaseTypeOrmRepository } from './base/base-typeorm.repository'

@Injectable()
export class TypeOrmAnswerCommentsRepository
  extends BaseTypeOrmRepository<AnswerComment>
  implements AnswerCommentsRepository {
  constructor (@InjectRepository(AnswerComment) repository: Repository<AnswerComment>) {
    super(repository)
  }

  async findManyByAnswerId (
    answerId: string,
    { page = 1, pageSize = 10, order = 'desc' }: PaginationParams
  ): Promise<PaginatedAnswerComments> {
    const pagination = this.formatPagination(page, pageSize)
    const [items, totalItems] = await this.findAndCount({
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
      items,
    }
  }

  async update ({ commentId, data }: UpdateCommentData): Promise<AnswerComment> {
    const updated = await this.updateOne({ id: commentId, ...data })
    return updated
  }
}
