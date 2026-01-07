import type { NotificationsRepository } from '@/domain/application/repositories/notifications.repository'
import { InMemoryNotificationsRepository } from '@/infra/persistence/repositories/in-memory/in-memory-notifications.repository'
import { FetchNotificationsUseCase } from './fetch-notifications.usecase'
import { makeNotificationData } from '@tests/factories/domain/make-notification'

describe('FetchNotificationsUseCase', () => {
  let sut: FetchNotificationsUseCase
  let notificationsRepository: NotificationsRepository

  beforeEach(() => {
    notificationsRepository = new InMemoryNotificationsRepository()
    sut = new FetchNotificationsUseCase(notificationsRepository)
  })

  it('should fetch notifications for a recipient', async () => {
    await notificationsRepository.create(makeNotificationData({ recipientId: 'recipient-id' }))
    await notificationsRepository.create(makeNotificationData({ recipientId: 'recipient-id' }))
    await notificationsRepository.create(makeNotificationData({ recipientId: 'other-recipient' }))

    const request = {
      recipientId: 'recipient-id',
    }

    const result = await sut.execute(request)

    expect(result.items).toHaveLength(2)
    expect(result.totalItems).toBe(2)
  })

  it('should return paginated results', async () => {
    for (let i = 0; i < 15; i++) {
      await notificationsRepository.create(makeNotificationData({ recipientId: 'recipient-id' }))
    }

    const request = {
      recipientId: 'recipient-id',
      page: 1,
      pageSize: 10,
    }

    const result = await sut.execute(request)

    expect(result.items).toHaveLength(10)
    expect(result.totalItems).toBe(15)
    expect(result.totalPages).toBe(2)
    expect(result.page).toBe(1)
    expect(result.pageSize).toBe(10)
  })

  it('should return empty array when no notifications exist', async () => {
    const request = {
      recipientId: 'recipient-id',
    }

    const result = await sut.execute(request)

    expect(result.items).toHaveLength(0)
    expect(result.totalItems).toBe(0)
  })

  it('should order notifications by createdAt descending by default', async () => {
    const older = await notificationsRepository.create(makeNotificationData({ recipientId: 'recipient-id' }))
    await new Promise(resolve => setTimeout(resolve, 10))
    const newer = await notificationsRepository.create(makeNotificationData({ recipientId: 'recipient-id' }))

    const request = {
      recipientId: 'recipient-id',
    }

    const result = await sut.execute(request)

    expect(result.items[0].id).toBe(newer.id)
    expect(result.items[1].id).toBe(older.id)
  })
})
