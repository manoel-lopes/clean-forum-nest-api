import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { AppModule } from '@/app.module'

export async function makeApp (): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile()
  const app = moduleRef.createNestApplication()
  await app.init()
  return app
}
