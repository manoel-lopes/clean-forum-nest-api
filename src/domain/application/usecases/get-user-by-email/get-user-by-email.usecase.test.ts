import type { UsersRepository } from '@/domain/application/repositories/users.repository'
import { InMemoryUsersRepository } from '@/infra/persistence/repositories/in-memory/in-memory-users.repository'
import { makeUserData } from '@/shared/util/factories/domain/make-user'
import { GetUserByEmailUseCase } from './get-user-by-email.usecase'

describe('GetUserByEmailUseCase', () => {
  let usersRepository: UsersRepository
  let sut: GetUserByEmailUseCase

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    sut = new GetUserByEmailUseCase(usersRepository)
  })

  it('should be able to get a user by email', async () => {
    const user = await usersRepository.create(makeUserData({
      email: 'johndoe@example.com',
    }))

    const request = { email: 'johndoe@example.com' }

    const response = await sut.execute(request)

    expect(response.id).toBe(user.id)
    expect(response.name).toBe(user.name)
    expect(response.email).toBe(user.email)
  })

  it('should not be able to get a non-existing user by email', async () => {
    const request = { email: 'nonexistent@example.com' }

    await expect(sut.execute(request)).rejects.toThrow('User not found')
  })
})
