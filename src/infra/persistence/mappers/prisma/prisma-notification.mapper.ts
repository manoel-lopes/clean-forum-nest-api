import type { Notification as PrismaNotification } from '@prisma/client'
import type { Notification } from '@/domain/enterprise/entities/notification.entity'

export class PrismaNotificationMapper {
  static toDomain (raw: PrismaNotification): Notification {
    return {
      id: raw.id,
      recipientId: raw.recipientId,
      title: raw.title,
      content: raw.content,
      readAt: raw.readAt,
      createdAt: raw.createdAt,
      updatedAt: null,
    }
  }
}
