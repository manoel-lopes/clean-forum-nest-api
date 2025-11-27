import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import type { AuthUser } from '../strategies/jwt.strategy'

export const CurrentUser = createParamDecorator(
  (data: keyof AuthUser | undefined, ctx: ExecutionContext): AuthUser | string => {
    const request = ctx.switchToHttp().getRequest()
    const user = request.user
    if (data) {
      return user[data]
    }
    return user
  }
)
