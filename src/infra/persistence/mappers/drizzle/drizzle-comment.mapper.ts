import type { comments } from '@/infra/persistence/drizzle/schema'
import type { AnswerComment } from '@/domain/enterprise/entities/answer-comment.entity'
import type { QuestionComment } from '@/domain/enterprise/entities/question-comment.entity'

type DrizzleComment = typeof comments.$inferSelect

export class DrizzleCommentMapper {
  static toAnswerComment (raw: DrizzleComment): AnswerComment {
    return {
      id: raw.id,
      content: raw.content,
      authorId: raw.authorId,
      answerId: raw.answerId!,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt ?? raw.createdAt,
    }
  }

  static toQuestionComment (raw: DrizzleComment): QuestionComment {
    return {
      id: raw.id,
      content: raw.content,
      authorId: raw.authorId,
      questionId: raw.questionId!,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt ?? raw.createdAt,
    }
  }
}
