import type { PaginatedItems } from '@/core/domain/application/paginated-items'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type { User, UserProps } from '@/domain/enterprise/entities/user.entity'

export type UpdateUserData = {
  where: { id: string }
  data: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>
}

export type PaginatedUsers = Required<PaginatedItems<User>>

export type UsersRepository = {
  create(user: UserProps): Promise<User>
  update(user: UpdateUserData): Promise<User>
  findById(userId: string): Promise<User | null>
  delete(userId: string): Promise<void>
  findByEmail(email: string): Promise<User | null>
  findMany(paginationParams: PaginationParams): Promise<PaginatedUsers>
}
