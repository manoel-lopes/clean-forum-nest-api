import type { QuestionComment } from '@/domain/enterprise/entities/question-comment.entity'
import type { Comment } from '@prisma/client'

export class PrismaQuestionCommentMapper {
  static toDomain (raw: Comment): QuestionComment {
    if (!raw.questionId) {
      throw new Error('Comment is not a question comment')
    }
    const comment: QuestionComment = {
      id: raw.id,
      content: raw.content,
      authorId: raw.authorId,
      questionId: raw.questionId,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt || raw.createdAt,
    }
    return comment
  }
}
