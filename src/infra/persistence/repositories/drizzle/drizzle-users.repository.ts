import { asc, count, desc, eq } from 'drizzle-orm'
import { Injectable } from '@nestjs/common'
import type { PaginatedItems } from '@/core/domain/application/paginated-items'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type { UpdateUserData, UsersRepository } from '@/domain/application/repositories/users.repository'
import { DrizzleService } from '@/infra/persistence/drizzle/drizzle.service'
import { users } from '@/infra/persistence/drizzle/schema'
import type { User, UserProps } from '@/domain/enterprise/entities/user.entity'
import { BaseDrizzleRepository } from './base/base-drizzle.repository'

@Injectable()
export class DrizzleUsersRepository extends BaseDrizzleRepository implements UsersRepository {
  constructor (private readonly drizzle: DrizzleService) {
    super()
  }

  async create (data: UserProps): Promise<User> {
    const [user] = await this.drizzle.db.insert(users).values(data).returning()
    return user
  }

  async update ({ where, data }: UpdateUserData): Promise<User> {
    const [updatedUser] = await this.drizzle.db
      .update(users)
      .set(data)
      .where(eq(users.id, where.id))
      .returning()
    return updatedUser
  }

  async findById (userId: string): Promise<User | null> {
    const [user] = await this.drizzle.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
    return user ?? null
  }

  async delete (userId: string): Promise<void> {
    await this.drizzle.db.delete(users).where(eq(users.id, userId))
  }

  async findByEmail (userEmail: string): Promise<User | null> {
    const [user] = await this.drizzle.db
      .select()
      .from(users)
      .where(eq(users.email, userEmail))
      .limit(1)
    return user ?? null
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
