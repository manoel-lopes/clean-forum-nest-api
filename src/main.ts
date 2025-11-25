import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import type { NestFastifyApplication } from '@nestjs/platform-fastify'
import { AppModule } from './app.module'
import { FastifyAdapter } from './infra/adapters/http/fastify-adapter'

async function bootstrap () {
  const fastifyAdapter = new FastifyAdapter()
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastifyAdapter
  )
  fastifyAdapter.configure(app)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  )
  await app.listen(3333)
}

bootstrap()
