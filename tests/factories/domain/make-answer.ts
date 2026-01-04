import { Answer, AnswerProps } from '@/domain/enterprise/entities/answer/answer.entity'
import { faker } from '@faker-js/faker'

export function makeAnswer (override: Partial<Answer> = {}): Answer {
  const content = override.content ?? faker.lorem.paragraphs()
  const excerpt = content.length > 45 ? content.substring(0, 45).trimEnd() + '...' : content + '...'
  const props: AnswerProps = {
    content,
    excerpt,
    authorId: faker.string.uuid(),
    questionId: faker.string.uuid(),
    ...override,
  }
  return Answer.create(props)
}
