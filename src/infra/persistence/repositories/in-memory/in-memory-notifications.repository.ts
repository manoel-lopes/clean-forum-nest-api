import { uuidv7 } from 'uuidv7'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type {
  NotificationsRepository,
  PaginatedNotifications,
} from '@/domain/application/repositories/notifications.repository'
import type { Notification, NotificationProps } from '@/domain/enterprise/entities/notification.entity'

export class InMemoryNotificationsRepository implements NotificationsRepository {
  private items: Notification[] = []

  async create (data: NotificationProps): Promise<Notification> {
    const notification: Notification = {
      id: uuidv7(),
      createdAt: new Date(),
      updatedAt: null,
      ...data,
    }
    this.items.push(notification)
    return notification
  }

  async save (notification: Notification): Promise<Notification> {
    const index = this.items.findIndex(item => item.id === notification.id)
    this.items[index] = notification
    return notification
  }

  async findById (id: string): Promise<Notification | null> {
    return this.items.find(item => item.id === id) ?? null
  }

  async findManyByRecipientId (
    recipientId: string,
    { page = 1, pageSize = 10, order = 'desc' }: PaginationParams
  ): Promise<PaginatedNotifications> {
    const filtered = this.items.filter(item => item.recipientId === recipientId)
    const sortedItems = [...filtered].sort((a, b) =>
      order === 'asc' ? a.createdAt.getTime() - b.createdAt.getTime() : b.createdAt.getTime() - a.createdAt.getTime()
    )
    const items = sortedItems.slice((page - 1) * pageSize, page * pageSize)
    const totalItems = filtered.length
    return {
      page,
      pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
      items,
      order,
    }
  }
}
