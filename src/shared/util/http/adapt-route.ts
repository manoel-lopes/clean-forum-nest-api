import type { WebController } from '@/core/presentation/web-controller'
import type { ApiRequest, ApiResponse } from '@/infra/http/ports/api'

export function adaptRoute (controller: WebController) {
  return async (req: ApiRequest, res: ApiResponse) => {
    const { statusCode, body } = await controller.handle(req)
    res.code(statusCode).send(body)
  }
}
