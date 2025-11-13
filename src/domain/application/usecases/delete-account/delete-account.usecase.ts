import type { UseCase } from '@/core/domain/application/use-case'
import type { RefreshTokensRepository } from '@/domain/application/repositories/refresh-tokens.repository'
import type { UsersRepository } from '@/domain/application/repositories/users.repository'

type DeleteAccountRequest = {
  userId: string
}

export class DeleteAccountUseCase implements UseCase {
  constructor (
    private readonly usersRepository: UsersRepository,
    private readonly refreshTokensRepository: RefreshTokensRepository
  ) {}

  async execute (req: DeleteAccountRequest) {
    const { userId } = req
    await this.refreshTokensRepository.deleteManyByUserId(userId)
    await this.usersRepository.delete(userId)
  }
}
