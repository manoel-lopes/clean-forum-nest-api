import type { NotificationsRepository } from '@/domain/application/repositories/notifications.repository'
import { InMemoryNotificationsRepository } from '@/infra/persistence/repositories/in-memory/in-memory-notifications.repository'
import { SendNotificationUseCase } from './send-notification.usecase'

describe('SendNotificationUseCase', () => {
  let sut: SendNotificationUseCase
  let notificationsRepository: NotificationsRepository

  beforeEach(() => {
    notificationsRepository = new InMemoryNotificationsRepository()
    sut = new SendNotificationUseCase(notificationsRepository)
  })

  it('should create a notification', async () => {
    const request = {
      recipientId: 'recipient-id',
      title: 'New notification',
      content: 'Notification content',
    }

    const notification = await sut.execute(request)

    expect(notification.id).toBeDefined()
    expect(notification.recipientId).toBe('recipient-id')
    expect(notification.title).toBe('New notification')
    expect(notification.content).toBe('Notification content')
    expect(notification.readAt).toBeNull()
    expect(notification.createdAt).toBeInstanceOf(Date)
  })

  it('should persist the notification in the repository', async () => {
    const request = {
      recipientId: 'recipient-id',
      title: 'Persisted notification',
      content: 'Content',
    }

    const notification = await sut.execute(request)

    const found = await notificationsRepository.findById(notification.id)

    expect(found).not.toBeNull()
    expect(found!.title).toBe('Persisted notification')
  })
})
