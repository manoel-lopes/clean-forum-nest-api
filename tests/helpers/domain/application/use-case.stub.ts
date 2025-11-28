import type { UseCase } from '@/core/domain/application/use-case'

export class UseCaseStub implements UseCase {
  async execute (): Promise<unknown> {
    return {}
  }
}

export class ThrowingUseCaseStub implements UseCase {
  async execute (): Promise<never> {
    throw new Error('Unexpected error')
  }
}
