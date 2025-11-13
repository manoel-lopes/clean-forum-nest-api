import jwt from 'jsonwebtoken'
import { env } from '@/lib/env'

export class JWTService {
  static sign (userId: string): string {
    return jwt.sign({ sub: userId }, env.JWT_SECRET, {
      expiresIn: '7d',
    })
  }

  static verify (token: string): string {
    const payload = jwt.verify(token, env.JWT_SECRET)
    if (typeof payload === 'string' || !payload.sub) {
      throw new Error('Invalid token payload')
    }
    return String(payload.sub)
  }
}
