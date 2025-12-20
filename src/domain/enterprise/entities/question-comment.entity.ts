import { ChildEntity } from 'typeorm'
import { Props } from '@/shared/types/custom/props'
import { Comment } from './base/comment.entity'

export type QuestionCommentProps = Props<QuestionComment>

@ChildEntity('question')
export class QuestionComment extends Comment {
  private constructor (props: QuestionCommentProps, id?: string) {
    super(props, id)
  }

  static create (props: QuestionCommentProps, id?: string): QuestionComment {
    return new QuestionComment(props, id)
  }
}
