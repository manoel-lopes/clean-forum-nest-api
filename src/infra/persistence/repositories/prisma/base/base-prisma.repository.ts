type SanitizedPagination = {
  page: number
  pageSize: number
  skip: number
  take: number
}

export abstract class BasePrismaRepository {
  protected static readonly MAX_PAGE_SIZE = 100

  protected sanitizePagination (page: number, pageSize: number): SanitizedPagination {
    const safePage = Math.max(1, page)
    const safePageSize = Math.min(Math.max(1, pageSize), BasePrismaRepository.MAX_PAGE_SIZE)
    return {
      page: safePage,
      pageSize: safePageSize,
      skip: (safePage - 1) * safePageSize,
      take: safePageSize,
    }
  }
}
