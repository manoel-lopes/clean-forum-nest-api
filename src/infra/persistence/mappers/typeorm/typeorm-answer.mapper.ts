import { Answer } from '@/domain/enterprise/entities/answer.entity'

export class TypeOrmAnswerMapper {
  static toDomain (raw: Answer): Answer {
    return Answer.create({
      content: raw.content,
      authorId: raw.authorId,
      questionId: raw.questionId,
      excerpt: raw.excerpt,
    }, raw.id)
  }
}
