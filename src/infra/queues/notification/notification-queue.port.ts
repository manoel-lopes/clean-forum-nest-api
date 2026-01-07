import type { NotificationJob } from './notification.processor'

export interface NotificationQueue {
  add(name: string, data: NotificationJob): Promise<unknown>
}

export const NotificationQueue = Symbol('NotificationQueue')
