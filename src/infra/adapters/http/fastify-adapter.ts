import type { INestApplication } from '@nestjs/common'
import { FastifyAdapter as NestFastifyAdapter } from '@nestjs/platform-fastify'
import { EnvService } from '@/infra/env/env.service'
import { FallbackController } from '@/presentation/controllers/fallback.controller'

export class FastifyAdapter extends NestFastifyAdapter {
  private appInstance?: INestApplication

  constructor () {
    super({
      logger: false,
    })
  }

  configure (app: INestApplication): void {
    this.appInstance = app
    const envService = app.get(EnvService)
    const nodeEnv = envService.get('NODE_ENV')
    if (nodeEnv !== 'development') {
      app.useLogger(false)
    }
    const fastifyInstance = this.getInstance()
    const logLevels: Record<string, string> = {
      test: 'silent',
      development: 'info',
      production: 'error',
    }
    const logLevel = logLevels[nodeEnv] || 'error'
    fastifyInstance.log.level = logLevel
    fastifyInstance.setErrorHandler(FallbackController.handle)
  }

  listen (port: string | number, hostname: string, callback?: () => void): void {
    const envService = this.appInstance?.get(EnvService)
    const finalPort = port ?? envService?.get('PORT')
    return super.listen(finalPort, hostname, callback)
  }
}
