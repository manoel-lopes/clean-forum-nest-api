import { EntityManager, EntityTarget, FindOneOptions, FindOptionsWhere, ObjectLiteral, Repository } from 'typeorm'

export abstract class BaseTypeOrmRepository<T extends ObjectLiteral> {
  protected readonly repository: Repository<T>

  constructor (
    readonly entity: EntityTarget<T>,
    readonly manager: EntityManager
  ) {
    this.repository = manager.getRepository(entity)
  }

  protected sanitizePagination (page: number, pageSize: number): {
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

  async save (entity: T): Promise<T> {
    return this.repository.save(entity)
  }

  async findOneById (id: string, relations?: string[]): Promise<T | null> {
    return this.repository.findOne({
      where: { id } as unknown as FindOptionsWhere<T>,
      relations,
    })
  }

  async findOne (options: FindOneOptions<T>): Promise<T | null> {
    return this.repository.findOne(options)
  }

  async find (options: FindOneOptions<T>): Promise<T[]> {
    return this.repository.find(options)
  }

  async delete (id: string): Promise<void> {
    await this.repository.delete(id)
  }

  async count (where?: FindOptionsWhere<T>): Promise<number> {
    return this.repository.count({ where })
  }
}
