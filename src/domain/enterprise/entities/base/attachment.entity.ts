import type { Entity } from '@/core/domain/entity'
import type { Props } from '@/shared/types/custom/props'

export type AttachmentProps = Props<Attachment>

export interface Attachment extends Entity {
  title: string
  url: string
}
