import type { Comment } from '@prisma/client'
import type { AnswerComment } from '@/domain/enterprise/entities/answer-comment.entity'

export class PrismaAnswerCommentMapper {
  static toDomain (raw: Comment): AnswerComment {
    if (!raw.answerId) {
      throw new Error('Comment is not an answer comment')
    }
    return {
      id: raw.id,
      content: raw.content,
      authorId: raw.authorId,
      answerId: raw.answerId,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    }
  }
}
