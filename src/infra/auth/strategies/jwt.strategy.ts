import { ExtractJwt, Strategy } from 'passport-jwt'
import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { EnvService } from '@/infra/env/env.service'

export type AuthUser = { id: string }

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor (envService: EnvService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: envService.get('JWT_SECRET'),
    })
  }

  validate (payload: { sub: string }): AuthUser {
    return { id: payload.sub }
  }
}
