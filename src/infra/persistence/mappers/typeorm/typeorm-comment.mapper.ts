import { AnswerComment } from '@/domain/enterprise/entities/answer-comment.entity'
import { Comment } from '@/domain/enterprise/entities/base/comment.entity'
import { QuestionComment } from '@/domain/enterprise/entities/question-comment.entity'

export class TypeOrmCommentMapper {
  static toDomain (raw: Comment): Comment {
    if (raw.answerId) {
      return AnswerComment.create({
        content: raw.content,
        authorId: raw.authorId,
        answerId: raw.answerId,
      }, raw.id)
    }
    return QuestionComment.create({
      content: raw.content,
      authorId: raw.authorId,
      questionId: raw.questionId,
    }, raw.id)
  }
}
