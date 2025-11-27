import compress from '@fastify/compress'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import type { INestApplication } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import type { NestFastifyApplication } from '@nestjs/platform-fastify'
import { FastifyAdapter } from '@nestjs/platform-fastify'
import { FallbackController } from '@/presentation/controllers/fallback.controller'
import { AppModule } from '@/app.module'

async function createApp (): Promise<INestApplication> {
  const fastifyAdapter = new FastifyAdapter({
    logger: false,
  })
  await fastifyAdapter.register(helmet as any, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ['\'self\''],
        styleSrc: ['\'self\'', '\'unsafe-inline\''],
        imgSrc: ['\'self\'', 'data:', 'validator.swagger.io'],
        scriptSrc: ['\'self\'', 'https: \'unsafe-inline\''],
      },
    },
  })
  await fastifyAdapter.register(cors as any, {
    origin: '*',
    credentials: true,
  })
  await fastifyAdapter.register(compress as any, {
    encodings: ['gzip', 'deflate'],
  })
  const nestApp = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastifyAdapter
  )
  nestApp.getHttpAdapter().getInstance().setErrorHandler(FallbackController.handle)
  await nestApp.init()
  return nestApp
}

let appPromise: Promise<INestApplication> | null = null

export const app: Promise<INestApplication> = (() => {
  if (!appPromise) {
    appPromise = createApp()
  }
  return appPromise
})()
