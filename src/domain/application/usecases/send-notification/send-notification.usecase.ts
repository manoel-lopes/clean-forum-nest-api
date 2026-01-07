import { Inject, Injectable } from '@nestjs/common'
import { UseCase } from '@/core/domain/application/use-case'
import { NotificationsRepository } from '@/domain/application/repositories/notifications.repository'
import type { Notification } from '@/domain/enterprise/entities/notification.entity'

type SendNotificationRequest = {
  recipientId: string
  title: string
  content: string
}

@Injectable()
export class SendNotificationUseCase implements UseCase {
  constructor (
    @Inject(NotificationsRepository) private readonly notificationsRepository: NotificationsRepository
  ) {}

  async execute (req: SendNotificationRequest): Promise<Notification> {
    const { recipientId, title, content } = req
    const notification = await this.notificationsRepository.create({
      recipientId,
      title,
      content,
      readAt: null,
    })
    return notification
  }
}
