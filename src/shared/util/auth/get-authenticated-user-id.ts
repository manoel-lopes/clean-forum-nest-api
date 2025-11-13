import type { HttpRequest } from '@/core/presentation/http-protocol'
import { JWTService } from '@/infra/auth/jwt/jwt-service'
import { extractToken } from './extract-token'

export function getAuthenticatedUserId (req: HttpRequest): string {
  const token = extractToken(req.headers?.authorization)
  const userId = JWTService.verify(token)
  return userId
}
