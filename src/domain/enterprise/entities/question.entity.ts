import type { Entity } from '@/core/domain/entity'
import type { Optional } from '@/shared/types/common/optional'
import type { Props } from '@/shared/types/custom/props'

export type QuestionProps = Optional<Omit<Props<Question>, 'answers'>, 'bestAnswerId'>

export interface Question extends Entity {
  authorId: string
  title: string
  content: string
  slug: string
  bestAnswerId?: string | null
}
