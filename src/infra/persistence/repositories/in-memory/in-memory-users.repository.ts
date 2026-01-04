import type { PaginatedItems } from '@/core/domain/paginated-items'
import type { PaginationParams } from '@/core/domain/pagination-params'
import type { UpdateUserData, UsersRepository } from '@/domain/application/repositories/users.repository'
import type { User } from '@/domain/enterprise/entities/user/user.entity'
import { BaseInMemoryRepository as BaseRepository } from './base/base-in-memory.repository'

export class InMemoryUsersRepository extends BaseRepository<User> implements UsersRepository {
  async update ({ userId, data }: UpdateUserData): Promise<User> {
    const updatedUser = await this.updateOne({ id: userId, ...data })
    return updatedUser
  }

  async findByEmail (email: string): Promise<User | null> {
    const user = await this.findOneBy('email', email)
    return user
  }

  async findMany ({ page = 1, pageSize = 10, order = 'desc' }: PaginationParams): Promise<PaginatedItems<User>> {
    const users = await this.findManyItems({ page, pageSize, order })
    return users
  }
}
