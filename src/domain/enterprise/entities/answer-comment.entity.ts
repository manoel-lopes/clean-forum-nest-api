import { Props } from '@/shared/types/custom/props'
import { ChildEntity, Comment } from './base/comment.entity'

export type AnswerCommentProps = Omit<Props<AnswerComment>, 'type'>

@ChildEntity('answer')
export class AnswerComment extends Comment {
  declare readonly answerId: string

  private constructor (props: AnswerCommentProps) {
    super(props)
  }

  static create (props: AnswerCommentProps): AnswerComment {
    return new AnswerComment(props)
  }
}
