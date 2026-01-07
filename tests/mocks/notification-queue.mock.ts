import type { NotificationQueue } from '@/infra/queues/notification/notification-queue.port'
import type { NotificationJob } from '@/infra/queues/notification/notification.processor'

type AddedJob = {
  name: string
  data: NotificationJob
}

export class MockNotificationQueue implements NotificationQueue {
  readonly addedJobs: AddedJob[] = []

  add (name: string, data: NotificationJob): Promise<null> {
    this.addedJobs.push({ name, data })
    return Promise.resolve(null)
  }

  clear (): void {
    this.addedJobs.length = 0
  }

  findJob (name: string): AddedJob | null {
    return this.addedJobs.find(job => job.name === name) ?? null
  }
}
