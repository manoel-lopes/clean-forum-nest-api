import { QuestionComment, QuestionCommentProps } from '@/domain/enterprise/entities/question-comment.entity'
import { faker } from '@faker-js/faker'

export function makeQuestionComment (override: Partial<QuestionComment> = {}): QuestionComment {
  const props: QuestionCommentProps = {
    content: faker.lorem.sentence(),
    authorId: faker.string.uuid(),
    questionId: faker.string.uuid(),
    ...override,
  }
  return QuestionComment.create(props)
}
