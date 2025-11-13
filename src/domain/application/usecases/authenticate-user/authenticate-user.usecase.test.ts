import type { UsersRepository } from '@/domain/application/repositories/users.repository'
import { PasswordHasherStub } from '@/infra/adapters/security/stubs/password-hasher.stub'
import { InMemoryRefreshTokensRepository } from '@/infra/persistence/repositories/in-memory/in-memory-refresh-tokens.repository'
import { InMemoryUsersRepository } from '@/infra/persistence/repositories/in-memory/in-memory-users.repository'
import type { PasswordHasher } from '@/infra/adapters/security/ports/password-hasher'
import { makeUserData } from '@/shared/util/factories/domain/make-user'
import { AuthenticateUserUseCase } from './authenticate-user.usecase'

vi.mock('@/lib/env', () => ({
  env: {
    NODE_ENV: 'development',
    JWT_SECRET: 'any_secret',
    REFRESH_TOKEN_SECRET: 'any_refresh_secret',
  },
}))

describe('AuthenticateUserUseCase', () => {
  let usersRepository: UsersRepository
  let passwordHasherStub: PasswordHasher
  let refreshTokensRepository: InMemoryRefreshTokensRepository
  let sut: AuthenticateUserUseCase

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    passwordHasherStub = new PasswordHasherStub()
    refreshTokensRepository = new InMemoryRefreshTokensRepository()
    sut = new AuthenticateUserUseCase(usersRepository, passwordHasherStub, refreshTokensRepository)
  })

  it('should not authenticate a inexistent user', async () => {
    const request = {
      email: 'nonexistent@example.com',
      password: 'any-password',
    }

    await expect(sut.execute(request)).rejects.toThrow('User not found')
  })

  it('should not authenticate a user passing the wrong password', async () => {
    const email = 'user@example.com'
    await usersRepository.create({
      ...makeUserData({ email }),
      password: await passwordHasherStub.hash('correct-password'),
    })

    const request = {
      email,
      password: 'wrong-password',
    }

    await expect(sut.execute(request)).rejects.toThrow('Invalid password')
  })

  it('should authenticate the user', async () => {
    const password = 'user-password'
    const user = await usersRepository.create({
      ...makeUserData({ email: 'user@example.com' }),
      password: await passwordHasherStub.hash(password),
    })

    const request = {
      email: user.email,
      password,
    }

    const response = await sut.execute(request)

    expect(response.token).toBeDefined()
    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
    const refreshToken = await refreshTokensRepository.findByUserId(user.id)
    if (refreshToken) {
      expect(refreshToken.userId).toEqual(user.id)
      expect(refreshToken.expiresAt.getDate()).toEqual(sevenDaysFromNow.getDate())
    }
  })
})
