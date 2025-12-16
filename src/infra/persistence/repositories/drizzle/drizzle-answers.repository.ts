import { asc, count, desc, eq } from 'drizzle-orm'
import { Injectable } from '@nestjs/common'
import type {
  AnswersRepository,
  AnswerWithRelations,
  FindManyByQuestionIdParams,
  PaginatedAnswers,
  UpdateAnswerData,
} from '@/domain/application/repositories/answers.repository'
import { DrizzleService } from '@/infra/persistence/drizzle/drizzle.service'
import { answers, attachments, comments, users } from '@/infra/persistence/drizzle/schema'
import type { Answer, AnswerProps } from '@/domain/enterprise/entities/answer.entity'
import type { AnswerAttachment } from '@/domain/enterprise/entities/answer-attachment.entity'
import type { AnswerComment } from '@/domain/enterprise/entities/answer-comment.entity'
import type { User } from '@/domain/enterprise/entities/user.entity'
import { BaseDrizzleRepository } from './base/base-drizzle.repository'

@Injectable()
export class DrizzleAnswersRepository extends BaseDrizzleRepository implements AnswersRepository {
  constructor (private readonly drizzle: DrizzleService) {
    super()
  }

  async create (data: AnswerProps): Promise<Answer> {
    const [answer] = await this.drizzle.db.insert(answers).values(data).returning()
    return answer
  }

  async findById (answerId: string): Promise<Answer | null> {
    const [answer] = await this.drizzle.db
      .select()
      .from(answers)
      .where(eq(answers.id, answerId))
      .limit(1)
    return answer ?? null
  }

  async update ({ data, where }: UpdateAnswerData): Promise<Answer> {
    const [updatedAnswer] = await this.drizzle.db
      .update(answers)
      .set(data)
      .where(eq(answers.id, where.id))
      .returning()
    return updatedAnswer
  }

  async delete (answerId: string): Promise<void> {
    await this.drizzle.db.delete(answers).where(eq(answers.id, answerId))
  }

  async findManyByQuestionId ({
    questionId,
    page = 1,
    pageSize = 10,
    order = 'desc',
    include = [],
  }: FindManyByQuestionIdParams): Promise<PaginatedAnswers> {
    const pagination = this.sanitizePagination(page, pageSize)
    const orderFn = order === 'desc' ? desc : asc
    const includeAuthor = include.includes('author')
    const includeComments = include.includes('comments')
    const includeAttachments = include.includes('attachments')
    const [answersList, [countResult]] = await Promise.all([
      this.drizzle.db.query.answers.findMany({
        where: eq(answers.questionId, questionId),
        orderBy: orderFn(answers.createdAt),
        offset: pagination.offset,
        limit: pagination.limit,
        with: {
          author: includeAuthor || undefined,
          comments: includeComments || undefined,
          attachments: includeAttachments || undefined,
        },
      }),
      this.drizzle.db
        .select({ count: count() })
        .from(answers)
        .where(eq(answers.questionId, questionId)),
    ])
    const totalItems = countResult.count
    return {
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pagination.pageSize),
      order,
      items: answersList.map(a => this.toAnswerWithRelations(a, includeAuthor, includeComments, includeAttachments)),
    }
  }

  private toAnswerWithRelations (
    a: typeof answers.$inferSelect & {
      author?: typeof users.$inferSelect
      comments?: (typeof comments.$inferSelect)[]
      attachments?: (typeof attachments.$inferSelect)[]
    },
    includeAuthor: boolean,
    includeComments: boolean,
    includeAttachments: boolean
  ): AnswerWithRelations {
    const result: AnswerWithRelations = {
      id: a.id,
      content: a.content,
      authorId: a.authorId,
      questionId: a.questionId,
      excerpt: a.excerpt,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
    }
    if (includeAuthor && a.author) {
      const author: Omit<User, 'password'> = {
        id: a.author.id,
        name: a.author.name,
        email: a.author.email,
        createdAt: a.author.createdAt,
        updatedAt: a.author.updatedAt,
      }
      result.author = author
    }
    if (includeComments && Array.isArray(a.comments)) {
      result.comments = a.comments.map((c): AnswerComment => ({
        ...c,
        answerId: c.answerId!,
        updatedAt: c.updatedAt ?? c.createdAt,
      }))
    }
    if (includeAttachments && Array.isArray(a.attachments)) {
      result.attachments = a.attachments.map((att): AnswerAttachment => ({
        id: att.id,
        title: att.title,
        url: att.link,
        answerId: att.answerId!,
        createdAt: att.createdAt,
        updatedAt: att.updatedAt ?? att.createdAt,
      }))
    }
    return result
  }
}
