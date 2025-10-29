import { AppModule } from './app.module'
import { env } from './lib/env'
import { NestFactory } from '@nestjs/core'

async function bootstrap () {
  const app = await NestFactory.create(AppModule)
  await app.listen(env.PORT)
}

bootstrap()
