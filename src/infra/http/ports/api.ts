export interface ApiRequest {
  body?: unknown
  params?: Record<string, string>
  query?: Record<string, string>
  headers?: Record<string, string>
}

export interface ApiResponse {
  status: (code: number) => ApiResponse
  json: (body: unknown) => void
  code: (statusCode: number) => ApiResponse
  send: (body: unknown) => void
}
