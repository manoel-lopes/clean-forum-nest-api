import { Injectable } from '@nestjs/common'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type {
  AnswerCommentsRepository,
  PaginatedAnswerComments,
} from '@/domain/application/repositories/answer-comments.repository'
import type { UpdateCommentData } from '@/domain/application/repositories/base/comments.repository'
import { PrismaAnswerCommentMapper } from '@/infra/persistence/mappers/prisma/prisma-answer-comment.mapper'
import { PrismaService } from '@/infra/persistence/prisma.service'
import type { AnswerComment, AnswerCommentProps } from '@/domain/enterprise/entities/answer-comment.entity'

@Injectable()
export class PrismaAnswerCommentsRepository implements AnswerCommentsRepository {
  constructor (private readonly prisma: PrismaService) {}

  async create (data: AnswerCommentProps): Promise<AnswerComment> {
    const comment = await this.prisma.comment.create({ data })
    return PrismaAnswerCommentMapper.toDomain(comment)
  }

  async update ({ where, data }: UpdateCommentData): Promise<AnswerComment> {
    const updatedComment = await this.prisma.comment.update({ where, data })
    return PrismaAnswerCommentMapper.toDomain(updatedComment)
  }

  async findById (commentId: string): Promise<AnswerComment | null> {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    })
    if (!comment || !comment.answerId) return null
    return PrismaAnswerCommentMapper.toDomain(comment)
  }

  async findManyByAnswerId (answerId: string, params: PaginationParams): Promise<PaginatedAnswerComments> {
    const { page = 1, pageSize = 10, order = 'desc' } = params
    const [comments, totalItems] = await this.prisma.$transaction([
      this.prisma.comment.findMany({
        where: { answerId },
        orderBy: { createdAt: order },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.comment.count({ where: { answerId } }),
    ])
    return {
      page,
      pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
      items: comments.map((comment) => PrismaAnswerCommentMapper.toDomain(comment)),
      order,
    }
  }

  async findAll (): Promise<AnswerComment[]> {
    const comments = await this.prisma.comment.findMany({
      where: { answerId: { not: null } },
    })
    return comments.map((comment) => PrismaAnswerCommentMapper.toDomain(comment))
  }

  async delete (commentId: string): Promise<void> {
    await this.prisma.comment.delete({ where: { id: commentId } })
  }
}
