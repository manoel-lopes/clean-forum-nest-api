import { Props } from '@/shared/types/custom/props'
import { Comment } from './base/comment.entity'

export type AnswerCommentProps = Omit<Props<AnswerComment>, 'type'>

export class AnswerComment extends Comment {
  declare readonly answerId: string
  declare readonly type: 'answer'

  private constructor (props: AnswerCommentProps) {
    super({ ...props, type: 'answer' })
  }

  static create (props: AnswerCommentProps): AnswerComment {
    return new AnswerComment(props)
  }
}
