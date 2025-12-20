import { AnswerComment, AnswerCommentProps } from '@/domain/enterprise/entities/answer-comment.entity'
import { faker } from '@faker-js/faker'

export function makeAnswerComment (override: Partial<AnswerComment> = {}): AnswerComment {
  const props: AnswerCommentProps = {
    content: faker.lorem.sentence(),
    authorId: faker.string.uuid(),
    answerId: faker.string.uuid(),
    questionId: undefined,
    ...override,
  }
  return AnswerComment.create(props)
}
