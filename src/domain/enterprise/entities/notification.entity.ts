import type { Entity } from '@/core/domain/entity'
import type { Props } from '@/shared/types/custom/props'

export type NotificationProps = Props<Notification>

export interface Notification extends Entity {
  recipientId: string
  title: string
  content: string
  readAt?: Date | null
}
