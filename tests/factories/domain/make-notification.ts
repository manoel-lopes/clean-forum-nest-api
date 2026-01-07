import type { NotificationProps } from '@/domain/enterprise/entities/notification.entity'
import { faker } from '@faker-js/faker'

export function makeNotificationData (override: Partial<NotificationProps> = {}): NotificationProps {
  const notification: NotificationProps = {
    recipientId: faker.string.uuid(),
    title: faker.lorem.sentence(),
    content: faker.lorem.paragraph(),
    readAt: null,
    ...override,
  }
  return notification
}
