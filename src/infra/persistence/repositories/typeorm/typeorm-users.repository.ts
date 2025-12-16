import { EntityManager } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type { PaginatedUsers, UpdateUserData, UsersRepository } from '@/domain/application/repositories/users.repository'
import { UserEntity } from '@/infra/persistence/typeorm/entities/user.entity'
import type { User, UserProps } from '@/domain/enterprise/entities/user.entity'
import { BaseTypeOrmRepository } from './base/base-typeorm.repository'

@Injectable()
export class TypeOrmUsersRepository extends BaseTypeOrmRepository<UserEntity> implements UsersRepository {
  constructor (
    @InjectEntityManager()
    manager: EntityManager
  ) {
    super(UserEntity, manager)
  }

  async create (data: UserProps): Promise<User> {
    const entity = this.repository.create(data)
    const saved = await this.repository.save(entity)
    return this.toDomain(saved)
  }

  async findById (userId: string): Promise<User | null> {
    const entity = await this.repository.findOne({ where: { id: userId } })
    return entity ? this.toDomain(entity) : null
  }

  async findByEmail (email: string): Promise<User | null> {
    const entity = await this.repository.findOne({ where: { email } })
    return entity ? this.toDomain(entity) : null
  }

  async update ({ where, data }: UpdateUserData): Promise<User> {
    await this.repository.update(where.id, data)
    const updated = await this.repository.findOneOrFail({ where: { id: where.id } })
    return this.toDomain(updated)
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
      items: usersList.map(u => this.toDomain(u)),
    }
  }

  private toDomain (entity: UserEntity): User {
    return {
      id: entity.id,
      name: entity.name,
      email: entity.email,
      password: entity.password,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    }
  }
}
