import type { RefreshTokensRepository } from '@/domain/application/repositories/refresh-tokens.repository'
import type { UsersRepository } from '@/domain/application/repositories/users.repository'
import { InMemoryRefreshTokensRepository } from '@/infra/persistence/repositories/in-memory/in-memory-refresh-tokens.repository'
import { InMemoryUsersRepository } from '@/infra/persistence/repositories/in-memory/in-memory-users.repository'
import { DeleteAccountUseCase } from './delete-account.usecase'
import { makeRefreshToken } from '@tests/factories/domain/make-refresh-token'
import { makeUser } from '@tests/factories/domain/make-user'

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
    const user = makeUser()
    await usersRepository.save(user)

    await sut.execute({ userId: user.id })

    const deletedAccount = await usersRepository.findById(user.id)
    expect(deletedAccount).toBeNull()
  })

  it('should delete the refresh token when deleting a user account', async () => {
    const user = makeUser()
    await usersRepository.save(user)
    const refreshToken = makeRefreshToken({ userId: user.id })
    await refreshTokensRepository.save(refreshToken)

    await sut.execute({ userId: user.id })

    const deletedAccount = await usersRepository.findById(user.id)
    const deletedRefreshToken = await refreshTokensRepository.findByUserId(user.id)
    expect(deletedAccount).toBeNull()
    expect(deletedRefreshToken).toBeNull()
  })

  it('should not delete a nonexistent user', async () => {
    const request = {
      userId: 'nonexistent-user-id',
    }

    await expect(sut.execute(request)).rejects.toThrow('User not found')
  })
})
