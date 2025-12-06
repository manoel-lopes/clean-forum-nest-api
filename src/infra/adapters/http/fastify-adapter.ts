import type { INestApplication } from '@nestjs/common'
import { FastifyAdapter as NestFastifyAdapter } from '@nestjs/platform-fastify'
import { EnvService } from '@/infra/env/env.service'

export class FastifyAdapter extends NestFastifyAdapter {
  constructor () {
    super({ logger: false })
  }

  configure (app: INestApplication): void {
    const envService = app.get(EnvService)
    const nodeEnv = envService.get('NODE_ENV')
    if (nodeEnv !== 'development') {
      app.useLogger(false)
    }
    const logLevels: Record<string, string> = {
      test: 'silent',
      development: 'info',
      production: 'error',
    }
    this.getInstance().log.level = logLevels[nodeEnv] || 'error'
  }
}
