import { Injectable } from '@nestjs/common'
import type { Comment as PrismaComment } from '@prisma/client'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type {
  CommentsRepository,
  PaginatedComments,
  UpdateCommentData,
} from '@/domain/application/repositories/comments.repository'
import { PrismaService } from '@/infra/persistence/prisma.service'
import type { Comment, CommentProps } from '@/domain/enterprise/entities/comment.entity'

function toDomain (raw: PrismaComment & { answerId: string }): Comment {
  return {
    id: raw.id,
    content: raw.content,
    authorId: raw.authorId,
    answerId: raw.answerId,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  }
}

@Injectable()
export class PrismaCommentsRepository implements CommentsRepository {
  constructor (private readonly prisma: PrismaService) {}

  async create (data: CommentProps): Promise<Comment> {
    const comment = await this.prisma.comment.create({ data })
    return toDomain({ ...comment, answerId: comment.answerId! })
  }

  async findById (commentId: string): Promise<Comment | null> {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    })
    if (!comment?.answerId) return null
    return toDomain({ ...comment, answerId: comment.answerId })
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
      items: comments.map(c => toDomain({ ...c, answerId: c.answerId! })),
      order,
    }
  }

  async update ({ where, data }: UpdateCommentData): Promise<Comment> {
    const comment = await this.prisma.comment.update({ where, data })
    return toDomain({ ...comment, answerId: comment.answerId! })
  }

  async delete (commentId: string): Promise<void> {
    await this.prisma.comment.delete({ where: { id: commentId } })
  }
}
