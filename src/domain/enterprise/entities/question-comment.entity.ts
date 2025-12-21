import { ChildEntity } from 'typeorm'
import { Props } from '@/shared/types/custom/props'
import { Comment } from './base/comment.entity'

export type QuestionCommentProps = Props<QuestionComment>

@ChildEntity('question')
export class QuestionComment extends Comment {
  private constructor (props: QuestionCommentProps) {
    super(props)
  }

  static create (props: QuestionCommentProps): QuestionComment {
    return new QuestionComment(props)
  }
}
