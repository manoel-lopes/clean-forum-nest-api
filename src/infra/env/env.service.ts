import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { Env } from './env'

@Injectable()
export class EnvService {
  constructor (private configService: ConfigService<Env, true>) {}

  get<T extends keyof Env> (key: T): Env[T] {
    return this.configService.get(key, { infer: true })
  }

  getDatabaseUrl (): string {
    const dbUser = process.env.DB_USER
    const dbPassword = process.env.DB_PASSWORD
    const dbHost = process.env.DB_HOST
    const dbPort = process.env.DB_PORT
    const dbName = process.env.DB_NAME
    const schema = process.env.DB_SCHEMA || 'public'
    return `postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}?schema=${schema}`
  }
}
