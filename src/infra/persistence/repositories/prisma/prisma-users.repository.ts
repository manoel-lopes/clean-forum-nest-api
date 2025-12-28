import { Injectable } from '@nestjs/common'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type { PaginatedUsers, UpdateUserData, UsersRepository } from '@/domain/application/repositories/users.repository'
import { formatPagination } from '@/infra/persistence/helpers/format-pagination.helper'
import { PrismaService } from '@/infra/persistence/prisma.service'
import type { User, UserProps } from '@/domain/enterprise/entities/user.entity'

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
  constructor (private readonly prisma: PrismaService) {}

  async create (data: UserProps): Promise<User> {
    return this.prisma.user.create({ data })
  }

  async update ({ where, data }: UpdateUserData): Promise<User> {
    return this.prisma.user.update({ where, data })
  }

  async findById (userId: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id: userId } })
  }

  async delete (userId: string): Promise<void> {
    await this.prisma.user.delete({ where: { id: userId } })
  }

  async findByEmail (userEmail: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email: userEmail } })
  }

  async findMany ({ page = 1, pageSize = 10, order = 'desc' }: PaginationParams): Promise<PaginatedUsers> {
    const pagination = formatPagination(page, pageSize)
    const [items, totalItems] = await Promise.all([
      this.prisma.user.findMany({
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: order },
      }),
      this.prisma.user.count(),
    ])
    return {
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pagination.pageSize),
      items,
      order,
    }
  }
}
