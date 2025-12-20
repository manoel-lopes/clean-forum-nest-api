import { EntityManager } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type { PaginatedUsers, UpdateUserData, UsersRepository } from '@/domain/application/repositories/users.repository'
import { TypeOrmUserMapper } from '@/infra/persistence/mappers/typeorm/typeorm-user.mapper'
import { User } from '@/domain/enterprise/entities/user.entity'
import { BaseTypeOrmRepository } from './base/base-typeorm.repository'

@Injectable()
export class TypeOrmUsersRepository extends BaseTypeOrmRepository<User> implements UsersRepository {
  constructor (
    @InjectEntityManager()
    manager: EntityManager
  ) {
    super(User, manager)
  }

  async save (user: User): Promise<User> {
    const saved = await this.repository.save(user)
    return TypeOrmUserMapper.toDomain(saved)
  }

  async findById (userId: string): Promise<User | null> {
    const user = await this.repository.findOne({ where: { id: userId } })
    return user ? TypeOrmUserMapper.toDomain(user) : null
  }

  async findByEmail (email: string): Promise<User | null> {
    const user = await this.repository.findOne({ where: { email } })
    return user ? TypeOrmUserMapper.toDomain(user) : null
  }

  async update ({ where, data }: UpdateUserData): Promise<User> {
    const updated = await this.repository.save({ id: where.id, ...data })
    return TypeOrmUserMapper.toDomain(updated)
  }

  override async delete (userId: string): Promise<void> {
    await this.repository.delete(userId)
  }

  async findMany ({ page = 1, pageSize = 10, order = 'desc' }: PaginationParams): Promise<PaginatedUsers> {
    const pagination = this.sanitizePagination(page, pageSize)
    const [usersList, totalItems] = await this.repository.findAndCount({
      order: { createdAt: order === 'desc' ? 'DESC' : 'ASC' },
      skip: pagination.offset,
      take: pagination.limit,
    })
    return {
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pagination.pageSize),
      order,
      items: usersList.map(TypeOrmUserMapper.toDomain),
    }
  }
}
