import type { AnswerComment, AnswerCommentProps } from '@/domain/enterprise/entities/answer-comment.entity'
import { faker } from '@faker-js/faker'

export function makeAnswerCommentData (override: Partial<AnswerComment> = {}): AnswerCommentProps {
  const comment: AnswerCommentProps = {
    content: faker.lorem.sentence(),
    authorId: faker.string.uuid(),
    answerId: faker.string.uuid(),
  }
  return Object.assign(comment, override)
}
