import { EntityManager } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type { UpdateCommentData } from '@/domain/application/repositories/base/comments.repository'
import type {
  PaginatedQuestionComments,
  QuestionCommentsRepository,
} from '@/domain/application/repositories/question-comments.repository'
import { CommentEntity } from '@/infra/persistence/typeorm/entities/comment.entity'
import type { QuestionComment, QuestionCommentProps } from '@/domain/enterprise/entities/question-comment.entity'
import { BaseTypeOrmRepository } from './base/base-typeorm.repository'

@Injectable()
export class TypeOrmQuestionCommentsRepository
  extends BaseTypeOrmRepository<CommentEntity>
  implements QuestionCommentsRepository {
  constructor (
    @InjectEntityManager()
    manager: EntityManager
  ) {
    super(CommentEntity, manager)
  }

  async create (data: QuestionCommentProps): Promise<QuestionComment> {
    const entity = this.repository.create({ ...data, answerId: null })
    const saved = await this.repository.save(entity)
    return this.toDomain(saved)
  }

  async findById (commentId: string): Promise<QuestionComment | null> {
    const entity = await this.repository.findOne({ where: { id: commentId } })
    if (!entity || !entity.questionId) return null
    return this.toDomain(entity)
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
      items: commentsList.map(c => this.toDomain(c)),
    }
  }

  async update ({ where, data }: UpdateCommentData): Promise<QuestionComment> {
    await this.repository.update(where.id, data)
    const updated = await this.repository.findOneOrFail({ where: { id: where.id } })
    return this.toDomain(updated)
  }

  override async delete (commentId: string): Promise<void> {
    await this.repository.delete(commentId)
  }

  private toDomain (entity: CommentEntity): QuestionComment {
    return {
      id: entity.id,
      content: entity.content,
      authorId: entity.authorId,
      questionId: entity.questionId!,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt ?? entity.createdAt,
    }
  }
}
