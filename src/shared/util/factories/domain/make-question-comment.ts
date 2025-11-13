import type { QuestionCommentProps } from '@/domain/enterprise/entities/question-comment.entity'
import { faker } from '@faker-js/faker'

export function makeQuestionCommentData (override: Partial<QuestionCommentProps> = {}): QuestionCommentProps {
  const comment: QuestionCommentProps = {
    content: faker.lorem.sentence(),
    authorId: faker.string.uuid(),
    questionId: faker.string.uuid(),
  }
  return Object.assign(comment, override)
}
