import { Inject, Injectable } from '@nestjs/common'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import { UseCase } from '@/core/domain/application/use-case'
import {
  NotificationsRepository,
  type PaginatedNotifications,
} from '@/domain/application/repositories/notifications.repository'

type FetchNotificationsRequest = {
  recipientId: string
} & PaginationParams

@Injectable()
export class FetchNotificationsUseCase implements UseCase {
  constructor (
    @Inject(NotificationsRepository) private readonly notificationsRepository: NotificationsRepository
  ) {}

  async execute (req: FetchNotificationsRequest): Promise<PaginatedNotifications> {
    const { recipientId, page, pageSize, order } = req
    return this.notificationsRepository.findManyByRecipientId(recipientId, { page, pageSize, order })
  }
}
