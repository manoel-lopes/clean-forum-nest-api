import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import type { PaginationParams } from '@/core/domain/pagination-params'
import type { PaginatedUsers, UpdateUserData, UsersRepository } from '@/domain/application/repositories/users.repository'
import { User } from '@/domain/enterprise/entities/user.entity'
import { BaseTypeOrmRepository } from './base/base-typeorm.repository'

@Injectable()
export class TypeOrmUsersRepository extends BaseTypeOrmRepository<User> implements UsersRepository {
  constructor (@InjectRepository(User) repository: Repository<User>) {
    super(repository)
  }

  async findByEmail (email: string): Promise<User | null> {
    const user = await this.findOne({ where: { email } })
    return user
  }

  async update ({ userId, data }: UpdateUserData): Promise<User> {
    const updated = await this.updateOne({ id: userId, ...data })
    return updated
  }

  async findMany ({
    page = 1,
    pageSize = 10,
    order = 'desc',
  }: PaginationParams): Promise<PaginatedUsers> {
    const pagination = this.formatPagination(page, pageSize)
    const [items, totalItems] = await this.findAndCount({
      order: { createdAt: order },
      skip: pagination.offset,
      take: pagination.limit,
    })
    return {
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pagination.pageSize),
      order,
      items,
    }
  }
}
