import { uuidv7 } from 'uuidv7'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type { PaginatedUsers, UpdateUserData, UsersRepository } from '@/domain/application/repositories/users.repository'
import type { User, UserProps } from '@/domain/enterprise/entities/user.entity'

export class InMemoryUsersRepository implements UsersRepository {
  private items: User[] = []

  async create (data: UserProps): Promise<User> {
    const user: User = {
      id: uuidv7(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
    }
    this.items.push(user)
    return user
  }

  async findById (id: string): Promise<User | null> {
    return this.items.find(item => item.id === id) ?? null
  }

  async update ({ userId, data }: UpdateUserData): Promise<User> {
    const index = this.items.findIndex(item => item.id === userId)
    const item = this.items[index]
    const updatedItem: User = {
      ...item,
      name: data.name ?? item.name,
      email: data.email ?? item.email,
      password: data.password ?? item.password,
    }
    this.items[index] = updatedItem
    return updatedItem
  }

  async delete (id: string): Promise<void> {
    this.items = this.items.filter(item => item.id !== id)
  }

  async findByEmail (email: string): Promise<User | null> {
    return this.items.find(item => item.email === email) ?? null
  }

  async findMany ({ page = 1, pageSize = 10, order = 'desc' }: PaginationParams): Promise<PaginatedUsers> {
    const sortedItems = [...this.items].sort((a, b) =>
      order === 'asc' ? a.createdAt.getTime() - b.createdAt.getTime() : b.createdAt.getTime() - a.createdAt.getTime()
    )
    const items = sortedItems.slice((page - 1) * pageSize, page * pageSize)
    const totalItems = this.items.length
    return {
      page,
      pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
      items,
      order,
    }
  }
}
