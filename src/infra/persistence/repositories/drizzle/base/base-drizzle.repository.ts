type SanitizedPagination = {
  page: number
  pageSize: number
  offset: number
  limit: number
}

export abstract class BaseDrizzleRepository {
  protected static readonly MAX_PAGE_SIZE = 100

  protected sanitizePagination (page: number, pageSize: number): SanitizedPagination {
    const safePage = Math.max(1, page)
    const safePageSize = Math.min(Math.max(1, pageSize), BaseDrizzleRepository.MAX_PAGE_SIZE)
    return {
      page: safePage,
      pageSize: safePageSize,
      offset: (safePage - 1) * safePageSize,
      limit: safePageSize,
    }
  }
}
