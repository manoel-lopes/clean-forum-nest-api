import type { SQL } from 'drizzle-orm'
import { and, asc, desc, eq } from 'drizzle-orm'
import type { PgColumn, PgTable, TableConfig } from 'drizzle-orm/pg-core'
import type { PgInsertValue } from 'drizzle-orm/pg-core/query-builders/insert'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type { DrizzleService } from '@/infra/persistence/drizzle/drizzle.service'

type SanitizedPagination = {
  page: number
  pageSize: number
  offset: number
  limit: number
}

type AnyPgTable = PgTable<TableConfig>
type HasIdColumn = { id: PgColumn }

type FindOneOptions<T> = {
  where: Partial<T>
}

type FindManyByOptions<T> = {
  where: Partial<T>
  params?: PaginationParams
}

type UpdateOneOptions<TSelect, TProps> = {
  where: Partial<TSelect>
  data: Partial<TProps>
}

type RemoveManyOptions<T> = {
  where: Partial<{ [K in keyof T]: T[K] | SQL }>
}

export abstract class BaseDrizzleRepository<
  TTable extends AnyPgTable & HasIdColumn,
  TEntity = TTable['$inferSelect'],
  TProps = TTable['$inferInsert']
> {
  private static readonly MAX_PAGE_SIZE = 100

  protected get idColumn () {
    return this.table.id
  }

  constructor (
    protected readonly drizzle: DrizzleService,
    protected readonly table: TTable
  ) {}

  protected async save (data: TProps): Promise<TTable['$inferSelect']> {
    const [entity] = await this.drizzle.db
      .insert(this.table)
      .values(data as PgInsertValue<TTable>)
      .returning()
    return entity as TTable['$inferSelect']
  }

  async findById (id: string): Promise<TEntity | null> {
    const [result] = await this.drizzle.db
      .select()
      .from(this.table as AnyPgTable)
      .where(eq(this.idColumn, id))
      .limit(1)
    return (result as TEntity) ?? null
  }

  async delete (id: string): Promise<void> {
    await this.drizzle.db
      .delete(this.table)
      .where(eq(this.idColumn, id))
  }

  protected async updateOne (
    options: UpdateOneOptions<TTable['$inferSelect'], TProps>
  ): Promise<TTable['$inferSelect']> {
    const { where, data } = options
    const conditions = this.buildWhereClause(where)
    const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions)
    const results = await this.drizzle.db
      .update(this.table)
      .set({ ...data } as Partial<TTable['$inferInsert']>)
      .where(whereClause)
      .returning() as TTable['$inferSelect'][]
    return results[0]
  }

  protected async saveMany (data: TProps[]): Promise<TTable['$inferSelect'][]> {
    if (data.length === 0) return []
    const results = await this.drizzle.db
      .insert(this.table)
      .values(data as PgInsertValue<TTable>[])
      .returning()
    return results
  }

  protected async findManyBy (
    options: FindManyByOptions<TTable['$inferSelect']>
  ): Promise<TTable['$inferSelect'][]> {
    const { where, params = {} } = options
    const { page = 1, pageSize = 20, order = 'desc' } = params
    const pagination = this.sanitizePagination(page, pageSize)
    const orderFn = order === 'desc' ? desc : asc
    const conditions = this.buildWhereClause(where)
    const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions)
    const results = await this.drizzle.db
      .select()
      .from(this.table as AnyPgTable)
      .where(whereClause)
      .orderBy(orderFn(this.table.id))
      .offset(pagination.offset)
      .limit(pagination.limit)
    return results as TTable['$inferSelect'][]
  }

  protected async removeMany (
    options: RemoveManyOptions<TTable['$inferSelect']>
  ): Promise<void> {
    const conditions = this.buildWhereClause(options.where)
    const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions)
    await this.drizzle.db
      .delete(this.table)
      .where(whereClause)
  }

  private buildWhereClause (where: Partial<TTable['$inferSelect']>) {
    return Object.entries(where).map(([key, value]) => {
      const column = this.table[key as keyof TTable] as PgColumn
      return eq(column, value)
    })
  }

  protected async findOne (
    options: FindOneOptions<TTable['$inferSelect']>
  ): Promise<TTable['$inferSelect'] | null> {
    const conditions = this.buildWhereClause(options.where)
    const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions)
    const results = await this.drizzle.db
      .select()
      .from(this.table as AnyPgTable)
      .where(whereClause)
      .limit(1)
    return (results[0] as TTable['$inferSelect']) ?? null
  }

  protected async deleteById (id: string): Promise<void> {
    await this.drizzle.db
      .delete(this.table)
      .where(eq(this.idColumn, id))
  }

  protected async deleteManyBy<TValue> (column: PgColumn, value: TValue): Promise<void> {
    await this.drizzle.db
      .delete(this.table)
      .where(eq(column, value))
  }

  protected sanitizePagination (page: number, pageSize: number): SanitizedPagination {
    const safePage = Math.max(1, page)
    const safePageSize = Math.min(
      Math.max(1, pageSize),
      BaseDrizzleRepository.MAX_PAGE_SIZE
    )
    return {
      page: safePage,
      pageSize: safePageSize,
      offset: (safePage - 1) * safePageSize,
      limit: safePageSize,
    }
  }
}
