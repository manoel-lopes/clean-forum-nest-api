import type { PaginatedItems } from '@/core/domain/application/paginated-items'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type { Notification, NotificationProps } from '@/domain/enterprise/entities/notification.entity'

export type PaginatedNotifications = Required<PaginatedItems<Notification>>

export type UpdateNotificationData = {
  notificationId: string
  data: Partial<Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>>
}

export type NotificationsRepository = {
  create(notification: NotificationProps): Promise<Notification>
  update(notificationData: UpdateNotificationData): Promise<Notification>
  findById(notificationId: string): Promise<Notification | null>
  findManyByRecipientId(recipientId: string, params: PaginationParams): Promise<PaginatedNotifications>
}

export const NotificationsRepository = Symbol('NotificationsRepository')
