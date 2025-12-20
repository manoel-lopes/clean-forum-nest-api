import { Question, QuestionProps } from '@/domain/enterprise/entities/question.entity'
import { Slug } from '@/domain/enterprise/value-objects/slug/slug.vo'
import { faker } from '@faker-js/faker'

export function makeQuestion (override: Partial<Question> = {}): Question {
  const title = override.title ?? faker.lorem.sentence()
  const slug = override.slug ?? Slug.create(title).value
  const props: QuestionProps = {
    title,
    slug,
    content: faker.lorem.paragraphs(),
    authorId: faker.string.uuid(),
    bestAnswerId: null,
    ...override,
  }
  return Question.create(props)
}
