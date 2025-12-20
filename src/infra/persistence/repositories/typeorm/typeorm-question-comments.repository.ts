import { EntityManager } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type { UpdateCommentData } from '@/domain/application/repositories/base/comments.repository'
import type {
  PaginatedQuestionComments,
  QuestionCommentsRepository,
} from '@/domain/application/repositories/question-comments.repository'
import { TypeOrmCommentMapper } from '@/infra/persistence/mappers/typeorm/typeorm-comment.mapper'
import { Comment } from '@/domain/enterprise/entities/base/comment.entity'
import { BaseTypeOrmRepository } from './base/base-typeorm.repository'

@Injectable()
export class TypeOrmQuestionCommentsRepository
  extends BaseTypeOrmRepository<Comment>
  implements QuestionCommentsRepository {
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
    if (!comment || !comment.questionId) return null
    return TypeOrmCommentMapper.toDomain(comment)
  }

  async findManyByQuestionId (
    questionId: string,
    { page = 1, pageSize = 10, order = 'desc' }: PaginationParams
  ): Promise<PaginatedQuestionComments> {
    const pagination = this.sanitizePagination(page, pageSize)
    const [commentsList, totalItems] = await this.repository.findAndCount({
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
