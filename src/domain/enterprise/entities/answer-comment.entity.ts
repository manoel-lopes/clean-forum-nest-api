import { ChildEntity } from 'typeorm'
import { Props } from '@/shared/types/custom/props'
import { Comment } from './base/comment.entity'

export type AnswerCommentProps = Props<AnswerComment>

@ChildEntity('answer')
export class AnswerComment extends Comment {
  private constructor (props: AnswerCommentProps, id?: string) {
    super(props, id)
  }

  static create (props: AnswerCommentProps, id?: string): AnswerComment {
    return new AnswerComment(props, id)
  }
}
