import { Injectable } from '@nestjs/common'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type { UpdateCommentData } from '@/domain/application/repositories/base/comments.repository'
import type {
  PaginatedQuestionComments,
  QuestionCommentsRepository,
} from '@/domain/application/repositories/question-comments.repository'
import { PrismaQuestionCommentMapper } from '@/infra/persistence/mappers/prisma/prisma-question-comment.mapper'
import { PrismaService } from '@/infra/persistence/prisma.service'
import type { QuestionComment, QuestionCommentProps } from '@/domain/enterprise/entities/question-comment.entity'

@Injectable()
export class PrismaQuestionCommentsRepository implements QuestionCommentsRepository {
  constructor (private readonly prisma: PrismaService) {}

  async create (data: QuestionCommentProps): Promise<QuestionComment> {
    const comment = await this.prisma.comment.create({ data })
    return PrismaQuestionCommentMapper.toDomain(comment)
  }

  async update ({ where, data }: UpdateCommentData): Promise<QuestionComment> {
    const updatedComment = await this.prisma.comment.update({ where, data })
    return PrismaQuestionCommentMapper.toDomain(updatedComment)
  }

  async findById (commentId: string): Promise<QuestionComment | null> {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    })
    if (!comment || !comment.questionId) return null
    return PrismaQuestionCommentMapper.toDomain(comment)
  }

  async findManyByQuestionId (questionId: string, params: PaginationParams): Promise<PaginatedQuestionComments> {
    const { page = 1, pageSize = 10, order = 'desc' } = params
    const [comments, totalItems] = await this.prisma.$transaction([
      this.prisma.comment.findMany({
        where: { questionId },
        orderBy: { createdAt: order },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.comment.count({ where: { questionId } }),
    ])
    return {
      page,
      pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
      items: comments.map((comment) => PrismaQuestionCommentMapper.toDomain(comment)),
      order,
    }
  }

  async findAll (): Promise<QuestionComment[]> {
    const comments = await this.prisma.comment.findMany({
      where: { questionId: { not: null } },
    })
    return comments.map((comment) => PrismaQuestionCommentMapper.toDomain(comment))
  }

  async delete (commentId: string): Promise<void> {
    await this.prisma.comment.delete({ where: { id: commentId } })
  }
}
