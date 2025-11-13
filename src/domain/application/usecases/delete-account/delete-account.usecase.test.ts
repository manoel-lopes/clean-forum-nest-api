import type { RefreshTokensRepository } from '@/domain/application/repositories/refresh-tokens.repository'
import type { UsersRepository } from '@/domain/application/repositories/users.repository'
import { InMemoryRefreshTokensRepository } from '@/infra/persistence/repositories/in-memory/in-memory-refresh-tokens.repository'
import { InMemoryUsersRepository } from '@/infra/persistence/repositories/in-memory/in-memory-users.repository'
import { makeRefreshTokenData } from '@/shared/util/factories/domain/make-refresh-token'
import { makeUserData } from '@/shared/util/factories/domain/make-user'
import { DeleteAccountUseCase } from './delete-account.usecase'

describe('DeleteAccountUseCase', () => {
  let sut: DeleteAccountUseCase
  let usersRepository: UsersRepository
  let refreshTokensRepository: RefreshTokensRepository

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    refreshTokensRepository = new InMemoryRefreshTokensRepository()
    sut = new DeleteAccountUseCase(usersRepository, refreshTokensRepository)
  })

  it('should delete a user account', async () => {
    const user = await usersRepository.create(makeUserData())

    await sut.execute({ userId: user.id })

    const deletedAccount = await usersRepository.findById(user.id)
    expect(deletedAccount).toBeNull()
  })

  it('should delete the refresh token when deleting a user account', async () => {
    const user = await usersRepository.create(makeUserData())
    await refreshTokensRepository.create(makeRefreshTokenData({ userId: user.id }))

    await sut.execute({ userId: user.id })

    const deletedAccount = await usersRepository.findById(user.id)
    const deletedRefreshToken = await refreshTokensRepository.findByUserId(user.id)
    expect(deletedAccount).toBeNull()
    expect(deletedRefreshToken).toBeNull()
  })
})
