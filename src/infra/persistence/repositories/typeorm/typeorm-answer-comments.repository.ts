import { EntityManager } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type {
  AnswerCommentsRepository,
  PaginatedAnswerComments,
} from '@/domain/application/repositories/answer-comments.repository'
import type { UpdateCommentData } from '@/domain/application/repositories/base/comments.repository'
import { TypeOrmCommentMapper } from '@/infra/persistence/mappers/typeorm/typeorm-comment.mapper'
import { Comment } from '@/domain/enterprise/entities/base/comment.entity'
import { BaseTypeOrmRepository } from './base/base-typeorm.repository'

@Injectable()
export class TypeOrmAnswerCommentsRepository
  extends BaseTypeOrmRepository<Comment>
  implements AnswerCommentsRepository {
  constructor (
    @InjectEntityManager()
    manager: EntityManager
  ) {
    super(Comment, manager)
  }

  async save (comment: Comment): Promise<Comment> {
    const saved = await this.repository.save(comment)
    return TypeOrmCommentMapper.toDomain(saved)
  }

  async findById (commentId: string): Promise<Comment | null> {
    const comment = await this.repository.findOne({ where: { id: commentId } })
    if (!comment || !comment.answerId) return null
    return TypeOrmCommentMapper.toDomain(comment)
  }

  async findManyByAnswerId (
    answerId: string,
    { page = 1, pageSize = 10, order = 'desc' }: PaginationParams
  ): Promise<PaginatedAnswerComments> {
    const pagination = this.sanitizePagination(page, pageSize)
    const [commentsList, totalItems] = await this.repository.findAndCount({
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
      items: commentsList.map(TypeOrmCommentMapper.toDomain),
    }
  }

  async update ({ where, data }: UpdateCommentData): Promise<Comment> {
    const updated = await this.repository.save({ id: where.id, ...data })
    return TypeOrmCommentMapper.toDomain(updated)
  }

  override async delete (commentId: string): Promise<void> {
    await this.repository.delete(commentId)
  }
}
