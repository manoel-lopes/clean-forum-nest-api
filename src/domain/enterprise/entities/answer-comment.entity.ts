import type { Props } from '@/shared/types/custom/props'
import type { Comment } from './base/comment.entity'

export type AnswerCommentProps = Props<AnswerComment>

export interface AnswerComment extends Comment {
  answerId: string
}
