import { Question } from '@/domain/enterprise/entities/question.entity'

export class TypeOrmQuestionMapper {
  static toDomain (raw: Question): Question {
    return Question.create({
      title: raw.title,
      slug: raw.slug,
      content: raw.content,
      authorId: raw.authorId,
      bestAnswerId: raw.bestAnswerId,
    }, raw.id)
  }
}
