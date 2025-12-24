import { Props } from '@/shared/types/custom/props'
import { ChildEntity, Comment } from './base/comment.entity'

export type QuestionCommentProps = Omit<Props<QuestionComment>, 'type'>

@ChildEntity('question')
export class QuestionComment extends Comment {
  declare readonly questionId: string

  private constructor (props: QuestionCommentProps) {
    super(props)
  }

  static create (props: QuestionCommentProps): QuestionComment {
    return new QuestionComment(props)
  }
}
