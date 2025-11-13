import type { HttpRequest, HttpResponse } from './http-protocol'

export interface WebController {
  handle: (request: HttpRequest) => Promise<HttpResponse>
}
