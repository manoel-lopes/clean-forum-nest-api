import type { PaginatedItems } from '@/core/domain/application/paginated-items'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type { UpdateCommentData } from '@/domain/application/repositories/base/comments.repository'
import type { PrismaService } from '@/infra/persistence/prisma.service'
import type { CommentMapperClass } from '@/infra/persistence/mappers/ports/comment-mapper'
import type { Comment, CommentProps } from '@/domain/enterprise/entities/base/comment.entity'

export type CommentForeignKey = 'questionId' | 'answerId'

export abstract class BasePrismaCommentsRepository<TComment extends Comment> {
  protected abstract readonly foreignKey: CommentForeignKey

  constructor (
    protected readonly prisma: PrismaService,
    protected readonly mapper: CommentMapperClass<TComment>
  ) {}

  async create (data: CommentProps): Promise<TComment> {
    const comment = await this.prisma.comment.create({ data })
    return this.mapper.toDomain(comment)
  }

  async update ({ where, data }: UpdateCommentData): Promise<TComment> {
    const comment = await this.prisma.comment.update({ where, data })
    return this.mapper.toDomain(comment)
  }

  async findById (commentId: string): Promise<TComment | null> {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    })
    if (!comment || !comment[this.foreignKey]) return null
    return this.mapper.toDomain(comment)
  }

  async delete (commentId: string): Promise<void> {
    await this.prisma.comment.delete({ where: { id: commentId } })
  }

  async findAll (): Promise<TComment[]> {
    const comments = await this.prisma.comment.findMany({
      where: { [this.foreignKey]: { not: null } },
    })
    return comments.map((c) => this.mapper.toDomain(c))
  }

  protected async findManyByForeignKey (
    foreignKeyValue: string,
    params: PaginationParams
  ): Promise<PaginatedItems<TComment>> {
    const { page = 1, pageSize = 10, order = 'desc' } = params
    const where = { [this.foreignKey]: foreignKeyValue }
    const [comments, totalItems] = await Promise.all([
      this.prisma.comment.findMany({
        where,
        orderBy: { createdAt: order },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.comment.count({ where }),
    ])
    return {
      page,
      pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
      items: comments.map((c) => this.mapper.toDomain(c)),
      order,
    }
  }
}
