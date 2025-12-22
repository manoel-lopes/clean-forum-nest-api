import { uuidv7 } from 'uuidv7'
import type { PaginatedItems } from '@/core/domain/application/paginated-items'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type { UpdateUserData, UsersRepository, UserWithoutPassword } from '@/domain/application/repositories/users.repository'
import type { User, UserProps } from '@/domain/enterprise/entities/user.entity'

function removePassword (user: User): UserWithoutPassword {
  const { password: _, ...userWithoutPassword } = user
  return userWithoutPassword
}

export class InMemoryUsersRepository implements UsersRepository {
  private items: User[] = []

  async create (data: UserProps): Promise<UserWithoutPassword> {
    const user: User = {
      id: uuidv7(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
    }
    this.items.push(user)
    return removePassword(user)
  }

  async findById (id: string): Promise<UserWithoutPassword | null> {
    const user = this.items.find(item => item.id === id)
    if (!user) return null
    return removePassword(user)
  }

  async update ({ where, data }: UpdateUserData): Promise<User> {
    const index = this.items.findIndex(item => item.id === where.id)
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
    const user = this.items.find(item => item.email === email)
    return user ?? null
  }

  async findMany ({ page = 1, pageSize = 10, order = 'desc' }: PaginationParams): Promise<PaginatedItems<UserWithoutPassword>> {
    const sortedItems = [...this.items].sort((a, b) =>
      order === 'asc' ? a.createdAt.getTime() - b.createdAt.getTime() : b.createdAt.getTime() - a.createdAt.getTime()
    )
    const paginatedItems = sortedItems.slice((page - 1) * pageSize, page * pageSize)
    const totalItems = this.items.length
    const totalPages = Math.ceil(totalItems / pageSize)
    return {
      page,
      pageSize,
      totalItems,
      totalPages,
      items: paginatedItems.map(removePassword),
      order,
    }
  }
}
