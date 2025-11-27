import { INestApplication, ValidationPipe } from '@nestjs/common'
import { AppModule } from '@/app.module'
import { Test } from '@nestjs/testing'

export async function makeApp (): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile()
  const app = moduleRef.createNestApplication()
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  )
  await app.init()
  return app
}
