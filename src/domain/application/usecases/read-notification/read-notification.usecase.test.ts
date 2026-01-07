import type { NotificationsRepository } from '@/domain/application/repositories/notifications.repository'
import { InMemoryNotificationsRepository } from '@/infra/persistence/repositories/in-memory/in-memory-notifications.repository'
import { ReadNotificationUseCase } from './read-notification.usecase'
import { makeNotificationData } from '@tests/factories/domain/make-notification'

describe('ReadNotificationUseCase', () => {
  let sut: ReadNotificationUseCase
  let notificationsRepository: NotificationsRepository

  beforeEach(() => {
    notificationsRepository = new InMemoryNotificationsRepository()
    sut = new ReadNotificationUseCase(notificationsRepository)
  })

  it('should mark a notification as read', async () => {
    const notification = await notificationsRepository.create(
      makeNotificationData({ recipientId: 'recipient-id' })
    )

    const request = {
      notificationId: notification.id,
      recipientId: 'recipient-id',
    }

    const result = await sut.execute(request)

    expect(result.readAt).toBeInstanceOf(Date)
  })

  it('should throw if notification does not exist', async () => {
    const request = {
      notificationId: 'non-existent-id',
      recipientId: 'recipient-id',
    }

    await expect(sut.execute(request)).rejects.toThrow('Notification not found')
  })

  it('should throw if user is not the recipient', async () => {
    const notification = await notificationsRepository.create(
      makeNotificationData({ recipientId: 'recipient-id' })
    )

    const request = {
      notificationId: notification.id,
      recipientId: 'different-recipient-id',
    }

    await expect(sut.execute(request)).rejects.toThrow('User is not the recipient of this notification')
  })

  it('should persist the read status', async () => {
    const notification = await notificationsRepository.create(
      makeNotificationData({ recipientId: 'recipient-id' })
    )

    const request = {
      notificationId: notification.id,
      recipientId: 'recipient-id',
    }

    await sut.execute(request)

    const found = await notificationsRepository.findById(notification.id)

    expect(found!.readAt).toBeInstanceOf(Date)
  })
})
