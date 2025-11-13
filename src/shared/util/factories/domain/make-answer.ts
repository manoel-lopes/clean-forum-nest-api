import type { AnswerProps } from '@/domain/enterprise/entities/answer.entity'
import { faker } from '@faker-js/faker'

export function makeAnswerData (override: Partial<AnswerProps> = {}): AnswerProps {
  const content = faker.lorem.paragraphs()
  const excerpt = content.length > 45 ? content.substring(0, 45).trimEnd() + '...' : content + '...'
  const answer: AnswerProps = {
    content,
    excerpt,
    authorId: faker.string.uuid(),
    questionId: faker.string.uuid(),
  }
  return Object.assign(answer, override)
}
