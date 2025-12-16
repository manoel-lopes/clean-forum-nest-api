import { EntityManager } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type {
  AnswerCommentsRepository,
  PaginatedAnswerComments,
} from '@/domain/application/repositories/answer-comments.repository'
import type { UpdateCommentData } from '@/domain/application/repositories/base/comments.repository'
import { CommentEntity } from '@/infra/persistence/typeorm/entities/comment.entity'
import type { AnswerComment, AnswerCommentProps } from '@/domain/enterprise/entities/answer-comment.entity'
import { BaseTypeOrmRepository } from './base/base-typeorm.repository'

@Injectable()
export class TypeOrmAnswerCommentsRepository
  extends BaseTypeOrmRepository<CommentEntity>
  implements AnswerCommentsRepository {
  constructor (
    @InjectEntityManager()
    manager: EntityManager
  ) {
    super(CommentEntity, manager)
  }

  async create (data: AnswerCommentProps): Promise<AnswerComment> {
    const entity = this.repository.create({ ...data, questionId: null })
    const saved = await this.repository.save(entity)
    return this.toDomain(saved)
  }

  async findById (commentId: string): Promise<AnswerComment | null> {
    const entity = await this.repository.findOne({ where: { id: commentId } })
    if (!entity || !entity.answerId) return null
    return this.toDomain(entity)
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
      items: commentsList.map(c => this.toDomain(c)),
    }
  }

  async update ({ where, data }: UpdateCommentData): Promise<AnswerComment> {
    await this.repository.update(where.id, data)
    const updated = await this.repository.findOneOrFail({ where: { id: where.id } })
    return this.toDomain(updated)
  }

  override async delete (commentId: string): Promise<void> {
    await this.repository.delete(commentId)
  }

  private toDomain (entity: CommentEntity): AnswerComment {
    return {
      id: entity.id,
      content: entity.content,
      authorId: entity.authorId,
      answerId: entity.answerId!,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt ?? entity.createdAt,
    }
  }
}
