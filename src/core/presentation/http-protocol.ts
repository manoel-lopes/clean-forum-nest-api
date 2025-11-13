export interface HttpRequest {
  body?: unknown
  params?: Record<string, string>
  query?: Record<string, string>
  headers?: Record<string, string>
}

export interface HttpResponse<T = unknown> {
  statusCode: number
  body?: T
}
