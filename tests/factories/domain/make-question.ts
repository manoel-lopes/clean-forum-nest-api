import type { Question, QuestionProps } from '@/domain/enterprise/entities/question.entity'
import { Slug } from '@/domain/enterprise/entities/value-objects/slug/slug.vo'
import { faker } from '@faker-js/faker'

export function makeQuestionData (override: Partial<Question> = {}): QuestionProps {
  const title = override.title ?? faker.lorem.sentence()
  const slug = override.slug ?? Slug.create(title).value
  const question: QuestionProps = {
    title,
    slug,
    content: faker.lorem.paragraphs(),
    authorId: faker.string.uuid(),
    bestAnswerId: null,
  }
  return Object.assign(question, override)
}
