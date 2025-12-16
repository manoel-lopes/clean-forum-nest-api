import { EntityManager } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import type {
  AnswersRepository,
  AnswerWithRelations,
  FindManyByQuestionIdParams,
  PaginatedAnswers,
  UpdateAnswerData,
} from '@/domain/application/repositories/answers.repository'
import { AnswerEntity } from '@/infra/persistence/typeorm/entities/answer.entity'
import type { Answer, AnswerProps } from '@/domain/enterprise/entities/answer.entity'
import type { AnswerAttachment } from '@/domain/enterprise/entities/answer-attachment.entity'
import type { AnswerComment } from '@/domain/enterprise/entities/answer-comment.entity'
import type { User } from '@/domain/enterprise/entities/user.entity'
import { BaseTypeOrmRepository } from './base/base-typeorm.repository'

@Injectable()
export class TypeOrmAnswersRepository extends BaseTypeOrmRepository<AnswerEntity> implements AnswersRepository {
  constructor (
    @InjectEntityManager()
    manager: EntityManager
  ) {
    super(AnswerEntity, manager)
  }

  async create (data: AnswerProps): Promise<Answer> {
    const entity = this.repository.create(data)
    const saved = await this.repository.save(entity)
    return this.toAnswer(saved)
  }

  async findById (answerId: string): Promise<Answer | null> {
    const entity = await this.repository.findOne({ where: { id: answerId } })
    return entity ? this.toAnswer(entity) : null
  }

  async update ({ data, where }: UpdateAnswerData): Promise<Answer> {
    await this.repository.update(where.id, data)
    const updated = await this.repository.findOneOrFail({ where: { id: where.id } })
    return this.toAnswer(updated)
  }

  override async delete (answerId: string): Promise<void> {
    await this.repository.delete(answerId)
  }

  async findManyByQuestionId ({
    questionId,
    page = 1,
    pageSize = 10,
    order = 'desc',
    include = [],
  }: FindManyByQuestionIdParams): Promise<PaginatedAnswers> {
    const pagination = this.sanitizePagination(page, pageSize)
    const relations: string[] = []
    if (include.includes('author')) relations.push('author')
    if (include.includes('comments')) relations.push('comments')
    if (include.includes('attachments')) relations.push('attachments')
    const [answersList, totalItems] = await this.repository.findAndCount({
      where: { questionId },
      order: { createdAt: order === 'desc' ? 'DESC' : 'ASC' },
      skip: pagination.offset,
      take: pagination.limit,
      relations,
    })
    return {
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pagination.pageSize),
      order,
      items: answersList.map(a => this.toAnswerWithRelations(a, include)),
    }
  }

  private toAnswer (entity: AnswerEntity): Answer {
    return {
      id: entity.id,
      content: entity.content,
      authorId: entity.authorId,
      questionId: entity.questionId,
      excerpt: entity.excerpt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    }
  }

  private toAnswerWithRelations (entity: AnswerEntity, include: string[]): AnswerWithRelations {
    const result: AnswerWithRelations = this.toAnswer(entity)
    if (include.includes('author') && entity.author) {
      result.author = this.toAuthor(entity.author)
    }
    if (include.includes('comments') && entity.comments) {
      result.comments = entity.comments.map(c => this.toAnswerComment(c))
    }
    if (include.includes('attachments') && entity.attachments) {
      result.attachments = entity.attachments.map(a => this.toAnswerAttachment(a))
    }
    return result
  }

  private toAuthor (entity: { id: string; name: string; email: string; createdAt: Date; updatedAt: Date }): Omit<User, 'password'> {
    return {
      id: entity.id,
      name: entity.name,
      email: entity.email,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    }
  }

  private toAnswerComment (entity: {
    id: string
    content: string
    authorId: string
    answerId: string | null
    createdAt: Date
    updatedAt: Date | null
  }): AnswerComment {
    return {
      id: entity.id,
      content: entity.content,
      authorId: entity.authorId,
      answerId: entity.answerId!,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt ?? entity.createdAt,
    }
  }

  private toAnswerAttachment (entity: {
    id: string
    title: string
    link: string
    answerId: string | null
    createdAt: Date
    updatedAt: Date | null
  }): AnswerAttachment {
    return {
      id: entity.id,
      title: entity.title,
      url: entity.link,
      answerId: entity.answerId!,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt ?? entity.createdAt,
    }
  }
}
