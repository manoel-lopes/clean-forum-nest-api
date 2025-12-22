import { Injectable } from '@nestjs/common'
import type { PaginatedItems } from '@/core/domain/application/paginated-items'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type { UpdateUserData, UsersRepository, UserWithoutPassword } from '@/domain/application/repositories/users.repository'
import { formatPagination } from '@/infra/persistence/helpers/format-pagination.helper'
import { PrismaUserMapper } from '@/infra/persistence/mappers/prisma/prisma-user.mapper'
import { PrismaService } from '@/infra/persistence/prisma.service'
import type { User, UserProps } from '@/domain/enterprise/entities/user.entity'

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
  constructor (private readonly prisma: PrismaService) {}

  async create (data: UserProps): Promise<UserWithoutPassword> {
    const user = await this.prisma.user.create({ data })
    return PrismaUserMapper.toDomain(user)
  }

  async update ({ where, data }: UpdateUserData): Promise<User> {
    const updatedUser = await this.prisma.user.update({ where, data })
    return updatedUser
  }

  async findById (userId: string): Promise<UserWithoutPassword | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    })
    if (!user) return null
    return PrismaUserMapper.toDomain(user)
  }

  async delete (userId: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id: userId },
    })
  }

  async findByEmail (userEmail: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email: userEmail },
    })
    if (!user) return null
    return user
  }

  async findMany ({ page = 1, pageSize = 10, order = 'desc' }: PaginationParams): Promise<PaginatedItems<UserWithoutPassword>> {
    const pagination = formatPagination(page, pageSize)
    const [users, totalItems] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: order },
      }),
      this.prisma.user.count(),
    ])
    const totalPages = Math.ceil(totalItems / pagination.pageSize)
    return {
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalItems,
      totalPages,
      items: users.map(PrismaUserMapper.toDomain),
      order,
    }
  }
}
