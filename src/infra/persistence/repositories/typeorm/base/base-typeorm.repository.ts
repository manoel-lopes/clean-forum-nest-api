import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository
} from 'typeorm'
import { BaseEntity } from '@/domain/enterprise/entities/base/base.entity'

export type UpdateEntityData<T> = DeepPartial<T>

export abstract class BaseTypeOrmRepository<T extends BaseEntity> {
  constructor (protected readonly repository: Repository<T>) {}

  async save (entity: T): Promise<void> {
    await this.repository.save(entity)
  }

  async findById (id: string): Promise<T | null> {
    const entity = await this.findOne({ where: { id } as FindOptionsWhere<T> })
    return entity
  }

  async delete (id: string): Promise<void> {
    await this.repository.delete(id)
  }

  protected async updateOne (data: UpdateEntityData<T> & { id: string }): Promise<T> {
    await this.repository.save(data)
    const entity = await this.findById(data.id)
    if (!entity) {
      throw new Error('Entity not found after update')
    }
    return entity
  }

  protected async findOne (options: FindOneOptions<T>): Promise<T | null> {
    const entity = await this.repository.findOne(options)
    return entity
  }

  protected async find (options: FindOneOptions<T>): Promise<T[]> {
    const entity = await this.repository.find(options)
    return entity
  }

  protected async findAndCount (options: FindManyOptions<T>): Promise<[T[], number]> {
    const entity = await this.repository.findAndCount(options)
    return entity
  }

  protected async createMany (entities: T[]): Promise<void> {
    if (!entities.length) return
    await this.repository.save(entities)
  }

  protected formatPagination (page: number, pageSize: number): {
    page: number
    pageSize: number
    limit: number
    offset: number
  } {
    const sanitizedPage = Math.max(1, Math.floor(page))
    const sanitizedPageSize = Math.max(1, Math.min(100, Math.floor(pageSize)))
    return {
      page: sanitizedPage,
      pageSize: sanitizedPageSize,
      limit: sanitizedPageSize,
      offset: (sanitizedPage - 1) * sanitizedPageSize,
    }
  }
}
