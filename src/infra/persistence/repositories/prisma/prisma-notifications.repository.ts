import { Injectable } from '@nestjs/common'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type {
  NotificationsRepository,
  PaginatedNotifications,
} from '@/domain/application/repositories/notifications.repository'
import { formatPagination } from '@/infra/persistence/helpers/format-pagination.helper'
import { PrismaNotificationMapper } from '@/infra/persistence/mappers/prisma/prisma-notification.mapper'
import { PrismaService } from '@/infra/persistence/prisma.service'
import type { Notification, NotificationProps } from '@/domain/enterprise/entities/notification.entity'

@Injectable()
export class PrismaNotificationsRepository implements NotificationsRepository {
  constructor (private readonly prisma: PrismaService) {}

  async create (data: NotificationProps): Promise<Notification> {
    const notification = await this.prisma.notification.create({ data })
    return PrismaNotificationMapper.toDomain(notification)
  }

  async save (notification: Notification): Promise<Notification> {
    const updated = await this.prisma.notification.update({
      where: { id: notification.id },
      data: { readAt: notification.readAt },
    })
    return PrismaNotificationMapper.toDomain(updated)
  }

  async findById (notificationId: string): Promise<Notification | null> {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    })
    if (!notification) return null
    return PrismaNotificationMapper.toDomain(notification)
  }

  async findManyByRecipientId (
    recipientId: string,
    { page = 1, pageSize = 10, order = 'desc' }: PaginationParams
  ): Promise<PaginatedNotifications> {
    const pagination = formatPagination(page, pageSize)
    const [notifications, totalItems] = await Promise.all([
      this.prisma.notification.findMany({
        where: { recipientId },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: order },
      }),
      this.prisma.notification.count({ where: { recipientId } }),
    ])
    return {
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pagination.pageSize),
      items: notifications.map(PrismaNotificationMapper.toDomain),
      order,
    }
  }
}
