import type { INestApplication, Type } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { AppModule } from '@/app.module'
import type { UseCase } from '@/core/domain/application/use-case'
import { ThrowingUseCaseStub } from '@tests/helpers/domain/application/use-case.stub'

type MakeAppWithErrorStubOptions = {
  useCaseClass: Type<UseCase>
}

export async function makeAppWithErrorStub (
  options: MakeAppWithErrorStubOptions
): Promise<INestApplication> {
  const { useCaseClass } = options
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(useCaseClass)
    .useClass(ThrowingUseCaseStub)
    .compile()
  const app = moduleRef.createNestApplication({ logger: false })
  app.enableShutdownHooks()
  await app.init()
  return app
}
