import { Injectable } from '@nestjs/common'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type {
  CommentsRepository,
  PaginatedComments,
  UpdateCommentData,
} from '@/domain/application/repositories/comments.repository'
import { PrismaService } from '@/infra/persistence/prisma.service'
import type { Comment, CommentProps } from '@/domain/enterprise/entities/comment.entity'

@Injectable()
export class PrismaCommentsRepository implements CommentsRepository {
  constructor (private readonly prisma: PrismaService) {}

  async create (data: CommentProps): Promise<Comment> {
    const comment = await this.prisma.comment.create({ data })
    return comment
  }

  async findById (commentId: string): Promise<Comment | null> {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    })
    if (!comment?.answerId) return null
    return comment
  }

  async findManyByAnswerId (answerId: string, params: PaginationParams): Promise<PaginatedComments> {
    const { page = 1, pageSize = 10, order = 'desc' } = params
    const where = { answerId }
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
      items: comments,
      order,
    }
  }

  async update ({ commentId, data }: UpdateCommentData): Promise<Comment> {
    const comment = await this.prisma.comment.update({ where: { id: commentId }, data })
    return comment
  }

  async delete (commentId: string): Promise<void> {
    await this.prisma.comment.delete({ where: { id: commentId } })
  }
}
