import { asc, count, desc } from 'drizzle-orm'
import { Injectable } from '@nestjs/common'
import type { PaginatedItems } from '@/core/domain/application/paginated-items'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type { UpdateUserData, UsersRepository } from '@/domain/application/repositories/users.repository'
import { DrizzleService } from '@/infra/persistence/drizzle/drizzle.service'
import { users } from '@/infra/persistence/drizzle/schema'
import type { User, UserProps } from '@/domain/enterprise/entities/user.entity'
import { BaseDrizzleRepository } from './base/base-drizzle.repository'

@Injectable()
export class DrizzleUsersRepository
  extends BaseDrizzleRepository<typeof users, User, UserProps>
  implements UsersRepository {
  constructor (drizzle: DrizzleService) {
    super(drizzle, users)
  }

  async create (data: UserProps): Promise<User> {
    return this.save(data)
  }

  async update ({ where, data }: UpdateUserData): Promise<User> {
    return this.updateOne({ where, data })
  }

  async delete (userId: string): Promise<void> {
    await this.deleteById(userId)
  }

  async findByEmail (userEmail: string): Promise<User | null> {
    return this.findOne({ where: { email: userEmail } })
  }

  async findMany ({ page = 1, pageSize = 10, order = 'desc' }: PaginationParams): Promise<PaginatedItems<User>> {
    const pagination = this.sanitizePagination(page, pageSize)
    const orderFn = order === 'desc' ? desc : asc
    const [usersList, [countResult]] = await Promise.all([
      this.drizzle.db
        .select()
        .from(users)
        .orderBy(orderFn(users.createdAt))
        .offset(pagination.offset)
        .limit(pagination.limit),
      this.drizzle.db.select({ count: count() }).from(users),
    ])
    const totalItems = countResult.count
    return {
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pagination.pageSize),
      items: usersList,
      order,
    }
  }
}
