import { Comment, CommentProps } from '@/domain/enterprise/entities/comment.entity'
import { faker } from '@faker-js/faker'

export function makeComment (override: Partial<Comment> = {}): Comment {
  const props: CommentProps = {
    content: faker.lorem.sentence(),
    authorId: faker.string.uuid(),
    answerId: faker.string.uuid(),
    ...override,
  }
  return Comment.create(props)
}
