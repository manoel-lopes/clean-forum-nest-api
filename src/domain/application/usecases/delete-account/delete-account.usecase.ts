import { Inject, Injectable } from '@nestjs/common'
import { UseCase } from '@/core/domain/application/use-case'
import { RefreshTokensRepository } from '@/domain/application/repositories/refresh-tokens.repository'
import { UsersRepository } from '@/domain/application/repositories/users.repository'

type DeleteAccountRequest = {
  userId: string
}

@Injectable()
export class DeleteAccountUseCase implements UseCase {
  constructor (
    @Inject(UsersRepository) private readonly usersRepository: UsersRepository,
    @Inject(RefreshTokensRepository) private readonly refreshTokensRepository: RefreshTokensRepository
  ) {}

  async execute (req: DeleteAccountRequest) {
    const { userId } = req
    await this.refreshTokensRepository.deleteManyByUserId(userId)
    await this.usersRepository.delete(userId)
  }
}
