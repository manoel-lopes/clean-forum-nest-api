import { Inject, Injectable } from '@nestjs/common'
import { UseCase } from '@/core/domain/application/use-case'
import { NotificationsRepository } from '@/domain/application/repositories/notifications.repository'
import type { Notification } from '@/domain/enterprise/entities/notification.entity'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'
import { NotRecipientError } from './not-recipient.error'

type ReadNotificationRequest = {
  notificationId: string
  recipientId: string
}

@Injectable()
export class ReadNotificationUseCase implements UseCase {
  constructor (
    @Inject(NotificationsRepository) private readonly notificationsRepository: NotificationsRepository
  ) {}

  async execute (req: ReadNotificationRequest): Promise<Notification> {
    const { notificationId, recipientId } = req
    const notification = await this.notificationsRepository.findById(notificationId)
    if (!notification) {
      throw new ResourceNotFoundError('Notification')
    }
    if (notification.recipientId !== recipientId) {
      throw new NotRecipientError()
    }
    return this.notificationsRepository.update({
      notificationId,
      data: { readAt: new Date() },
    })
  }
}
