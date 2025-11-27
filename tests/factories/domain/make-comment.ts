import type { Comment, CommentProps } from '@/domain/enterprise/entities/base/comment.entity'
import { faker } from '@faker-js/faker'

export function makeCommentData (override: Partial<Comment> = {}): CommentProps {
  const comment: CommentProps = {
    content: faker.lorem.sentence(),
    authorId: faker.string.uuid(),
  }
  return Object.assign(comment, override)
}
