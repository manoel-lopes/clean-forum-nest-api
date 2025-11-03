import type { Entity } from '@/core/domain/entity'
import type { Props } from '@/shared/types/custom/props'

export type AnswerProps = Props<Answer>

export interface Answer extends Entity {
  content: string
  questionId: string
  authorId: string
  excerpt: string
}
