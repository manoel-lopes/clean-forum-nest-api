import { Props } from '@/shared/types/custom/props'
import { Comment } from './base/comment.entity'

export type QuestionCommentProps = Omit<Props<QuestionComment>, 'type'>

export class QuestionComment extends Comment {
  declare readonly questionId: string
  declare readonly type: 'question'

  private constructor (props: QuestionCommentProps) {
    super({ ...props, type: 'question' })
  }

  static create (props: QuestionCommentProps): QuestionComment {
    return new QuestionComment(props)
  }
}
