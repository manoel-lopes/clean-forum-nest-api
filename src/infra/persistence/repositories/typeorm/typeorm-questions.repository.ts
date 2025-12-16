import { EntityManager } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type { AnswerWithRelations } from '@/domain/application/repositories/answers.repository'
import type {
  FindManyQuestionsParams,
  FindQuestionBySlugParams,
  FindQuestionsResult,
  PaginatedQuestions,
  QuestionsRepository,
  QuestionWithRelations,
  UpdateQuestionData,
} from '@/domain/application/repositories/questions.repository'
import { AnswerEntity } from '@/infra/persistence/typeorm/entities/answer.entity'
import { QuestionEntity } from '@/infra/persistence/typeorm/entities/question.entity'
import type { Question, QuestionProps } from '@/domain/enterprise/entities/question.entity'
import type { QuestionAttachment } from '@/domain/enterprise/entities/question-attachment.entity'
import type { QuestionComment } from '@/domain/enterprise/entities/question-comment.entity'
import type { User } from '@/domain/enterprise/entities/user.entity'
import { BaseTypeOrmRepository } from './base/base-typeorm.repository'

@Injectable()
export class TypeOrmQuestionsRepository extends BaseTypeOrmRepository<QuestionEntity> implements QuestionsRepository {
  constructor (
    @InjectEntityManager()
    manager: EntityManager
  ) {
    super(QuestionEntity, manager)
  }

  async create (data: QuestionProps): Promise<Question> {
    const entity = this.repository.create(data)
    const saved = await this.repository.save(entity)
    return this.toQuestion(saved)
  }

  async findById (questionId: string): Promise<Question | null> {
    const entity = await this.repository.findOne({ where: { id: questionId } })
    return entity ? this.toQuestion(entity) : null
  }

  async findByTitle (questionTitle: string): Promise<Question | null> {
    const entity = await this.repository.findOne({ where: { title: questionTitle } })
    return entity ? this.toQuestion(entity) : null
  }

  async findBySlug ({
    slug,
    page = 1,
    pageSize = 10,
    order = 'desc',
    include = [],
    answerIncludes = [],
  }: FindQuestionBySlugParams): Promise<FindQuestionsResult> {
    const pagination = this.sanitizePagination(page, pageSize)
    const relations: string[] = []
    if (include.includes('author')) relations.push('author')
    if (include.includes('comments')) relations.push('comments')
    if (include.includes('attachments')) relations.push('attachments')
    const entity = await this.repository.findOne({ where: { slug }, relations })
    if (!entity) return null
    const answersRepo = this.manager.getRepository(AnswerEntity)
    const answerRelations: string[] = []
    if (answerIncludes.includes('author')) answerRelations.push('author')
    if (answerIncludes.includes('comments')) answerRelations.push('comments')
    if (answerIncludes.includes('attachments')) answerRelations.push('attachments')
    const [answersList, totalAnswers] = await answersRepo.findAndCount({
      where: { questionId: entity.id },
      order: { createdAt: order === 'desc' ? 'DESC' : 'ASC' },
      skip: pagination.offset,
      take: pagination.limit,
      relations: answerRelations,
    })
    const result: QuestionWithRelations = {
      ...this.toQuestion(entity),
      answers: {
        page: pagination.page,
        pageSize: Math.min(pagination.pageSize, totalAnswers),
        totalItems: totalAnswers,
        totalPages: Math.ceil(totalAnswers / pagination.pageSize),
        order,
        items: answersList.map(a => this.toAnswerWithRelations(a, answerIncludes)),
      },
    }
    if (include.includes('author') && entity.author) {
      result.author = this.toAuthor(entity.author)
    }
    if (include.includes('comments') && entity.comments) {
      result.comments = entity.comments.map(c => this.toQuestionComment(c))
    }
    if (include.includes('attachments') && entity.attachments) {
      result.attachments = entity.attachments.map(a => this.toQuestionAttachment(a))
    }
    return result
  }

  async findMany ({
    page = 1,
    pageSize = 20,
    order = 'desc',
    include = [],
  }: FindManyQuestionsParams): Promise<PaginatedQuestions> {
    const pagination = this.sanitizePagination(page, pageSize)
    const relations: string[] = []
    if (include.includes('author')) relations.push('author')
    if (include.includes('comments')) relations.push('comments')
    if (include.includes('attachments')) relations.push('attachments')
    const [questionsList, totalItems] = await this.repository.findAndCount({
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
      items: questionsList.map(q => this.toQuestionWithRelations(q, include)),
    }
  }

  async update ({ data, where }: UpdateQuestionData): Promise<Question> {
    await this.repository.update(where.id, data)
    const updated = await this.repository.findOneOrFail({ where: { id: where.id } })
    return this.toQuestion(updated)
  }

  override async delete (questionId: string): Promise<void> {
    await this.repository.delete(questionId)
  }

  async findManyByUserId (
    userId: string,
    { page = 1, pageSize = 10, order = 'desc' }: PaginationParams
  ): Promise<PaginatedQuestions> {
    const pagination = this.sanitizePagination(page, pageSize)
    const [questionsList, totalItems] = await this.repository.findAndCount({
      where: { authorId: userId },
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
      items: questionsList.map(q => this.toQuestionWithRelations(q, [])),
    }
  }

  private toQuestion (entity: QuestionEntity): Question {
    return {
      id: entity.id,
      title: entity.title,
      slug: entity.slug,
      content: entity.content,
      authorId: entity.authorId,
      bestAnswerId: entity.bestAnswerId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    }
  }

  private toQuestionWithRelations (entity: QuestionEntity, include: string[]): QuestionWithRelations {
    const result: QuestionWithRelations = {
      ...this.toQuestion(entity),
      answers: {
        page: 1,
        pageSize: 20,
        totalItems: 0,
        totalPages: 0,
        items: [],
        order: 'desc',
      },
    }
    if (include.includes('author') && entity.author) {
      result.author = this.toAuthor(entity.author)
    }
    if (include.includes('comments') && entity.comments) {
      result.comments = entity.comments.map(c => this.toQuestionComment(c))
    }
    if (include.includes('attachments') && entity.attachments) {
      result.attachments = entity.attachments.map(a => this.toQuestionAttachment(a))
    }
    return result
  }

  private toAnswerWithRelations (entity: AnswerEntity, include: string[]): AnswerWithRelations {
    const result: AnswerWithRelations = {
      id: entity.id,
      content: entity.content,
      authorId: entity.authorId,
      questionId: entity.questionId,
      excerpt: entity.excerpt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    }
    if (include.includes('author') && entity.author) {
      result.author = this.toAuthor(entity.author)
    }
    if (include.includes('comments') && entity.comments) {
      result.comments = entity.comments.map(c => ({
        id: c.id,
        content: c.content,
        authorId: c.authorId,
        answerId: c.answerId!,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt ?? c.createdAt,
      }))
    }
    if (include.includes('attachments') && entity.attachments) {
      result.attachments = entity.attachments.map(a => ({
        id: a.id,
        title: a.title,
        url: a.link,
        answerId: a.answerId!,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt ?? a.createdAt,
      }))
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

  private toQuestionComment (entity: {
    id: string
    content: string
    authorId: string
    questionId: string | null
    createdAt: Date
    updatedAt: Date | null
  }): QuestionComment {
    return {
      id: entity.id,
      content: entity.content,
      authorId: entity.authorId,
      questionId: entity.questionId!,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt ?? entity.createdAt,
    }
  }

  private toQuestionAttachment (entity: {
    id: string
    title: string
    link: string
    questionId: string | null
    createdAt: Date
    updatedAt: Date | null
  }): QuestionAttachment {
    return {
      id: entity.id,
      title: entity.title,
      url: entity.link,
      questionId: entity.questionId!,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt ?? entity.createdAt,
    }
  }
}
