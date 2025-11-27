export function mockPaginatedResponse<T> (
  page: number,
  pageSize: number,
  totalItems: number,
  items: T[],
  order: 'asc' | 'desc' = 'desc'
) {
  return {
    page,
    pageSize,
    totalItems,
    totalPages: Math.ceil(totalItems / pageSize),
    items,
    order,
  }
}
