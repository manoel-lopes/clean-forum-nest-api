import { ChildEntity } from 'typeorm'
import { Props } from '@/shared/types/custom/props'
import { Comment } from './base/comment.entity'

export type AnswerCommentProps = Props<AnswerComment>

@ChildEntity('answer')
export class AnswerComment extends Comment {
  private constructor (props: AnswerCommentProps) {
    super(props)
  }

  static create (props: AnswerCommentProps): AnswerComment {
    return new AnswerComment(props)
  }
}
