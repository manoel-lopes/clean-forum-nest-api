type PaginationQuery = {
  page?: number
  pageSize?: number
  order?: 'asc' | 'desc'
  include?: string
}

type HttpFetchRequestParams = {
  params?: Record<string, unknown>
  query?: PaginationQuery
}

export function makeHttpFetchRequest (
  page?: number,
  pageSize?: number,
  order?: 'asc' | 'desc'
): HttpFetchRequestParams {
  return {
    query: { page, pageSize, order },
  }
}

export function makeHttpFetchRequestWithParams (
  params: Record<string, unknown>,
  page?: number,
  pageSize?: number,
  order?: 'asc' | 'desc',
  include?: string
): HttpFetchRequestParams {
  return {
    params,
    query: { page, pageSize, order, include },
  }
}
