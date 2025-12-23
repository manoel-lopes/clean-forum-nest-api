import type { Comment, CommentProps } from '@/domain/enterprise/entities/base/comment.entity'
import { faker } from '@faker-js/faker'

type BaseCommentData = Omit<CommentProps, 'type'>

export function makeCommentData (override: Partial<Comment> = {}): BaseCommentData {
  const comment: BaseCommentData = {
    content: faker.lorem.sentence(),
    authorId: faker.string.uuid(),
  }
  return Object.assign(comment, override)
}
