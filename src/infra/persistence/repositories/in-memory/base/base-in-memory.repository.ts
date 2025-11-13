import { uuidv7 } from 'uuidv7'
import type { PaginatedItems } from '@/core/domain/application/paginated-items'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type { Entity } from '@/core/domain/entity'
import type { Props } from '@/shared/types/custom/props'

export type FindManyItemsByParams<Item> = {
  where: {
    [key in keyof Item]?: Item[key]
  }
  params: PaginationParams
}

export abstract class BaseInMemoryRepository<Item extends Entity> {
  protected items: Item[] = []

  async create (data: Props<Item>): Promise<Item> {
    const item = {
      id: uuidv7(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
    } as Item
    this.items.push(item)
    return item
  }

  async findById (id: string): Promise<Item | null> {
    return this.items.find((item) => item.id === id) || null
  }

  async delete (id: string) {
    this.items = this.items.filter((item) => item.id !== id)
  }

  protected async findManyItems ({
    page = 1,
    pageSize = 10,
    order = 'desc',
  }: PaginationParams): Promise<PaginatedItems<Item>> {
    const items = this.sortItems(this.items, order).slice((page - 1) * pageSize, page * pageSize)
    return this.paginate({ items, page, pageSize, order })
  }

  protected async findManyItemsBy ({ where, params }: FindManyItemsByParams<Item>): Promise<PaginatedItems<Item>> {
    const { page = 1, pageSize = 20, order = 'desc' } = params
    const filteredItems = this.filterItems(this.items, where)
    const sortedItems = this.sortItems(filteredItems, order)
    const paginatedItems = sortedItems.slice((page - 1) * pageSize, page * pageSize)
    const totalItems = filteredItems.length
    const totalPages = Math.ceil(totalItems / pageSize)
    return {
      page,
      pageSize,
      totalItems,
      totalPages,
      items: paginatedItems,
      order,
    }
  }

  protected paginate<T extends Entity>({
    items,
    page = 1,
    pageSize = 10,
    order = 'desc',
  }: PaginationParams & { items: T[] }): PaginatedItems<T> {
    const totalItems = items.length
    const totalPages = Math.ceil(totalItems / pageSize)
    const paginatedItems = this.sortItems(items, order).slice((page - 1) * pageSize, page * pageSize)
    return {
      page,
      pageSize,
      totalItems,
      totalPages,
      items: paginatedItems,
      order,
    }
  }

  protected async findOneBy<Value>(key: keyof Item, value: Value): Promise<Item | null> {
    return this.items.find((item) => item[key] === value) || null
  }

  protected async deleteOneBy<Value>(key: keyof Item, value: Value) {
    this.items = this.items.filter((item) => item[key] !== value)
  }

  async updateOne<UpdateData extends Record<string, unknown>>(updateData: {
    where: { id: string }
    data: UpdateData
  }): Promise<Item> {
    const { where, data } = updateData
    const index = this.items.findIndex((item) => item.id === where.id)
    const item = this.items[index]
    const cleanedData = this.cleanData(data)
    const updatedItem = { ...item, ...cleanedData }
    this.items[index] = updatedItem
    return updatedItem
  }

  private filterItems (
    items: Item[],
    where: {
      [key in keyof Item]?: Item[key]
    }
  ): Item[] {
    return items.filter((item) =>
      Object.entries(where).every(([key, value]) => {
        return item[key as keyof Item] === value
      })
    )
  }

  private sortItems<T extends Entity>(items: T[], order: 'asc' | 'desc'): T[] {
    return items.sort((a, b) =>
      order === 'asc' ? a.createdAt.getTime() - b.createdAt.getTime() : b.createdAt.getTime() - a.createdAt.getTime()
    )
  }

  private cleanData (data: Record<string, unknown>) {
    return Object.fromEntries(Object.entries(data).filter(([_, value]) => value))
  }
}
