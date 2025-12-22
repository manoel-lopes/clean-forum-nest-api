import type { UsersRepository, UserWithoutPassword } from '@/domain/application/repositories/users.repository'
import { PasswordHasherStub } from '@/infra/adapters/security/stubs/password-hasher.stub'
import { InMemoryUsersRepository } from '@/infra/persistence/repositories/in-memory/in-memory-users.repository'
import type { UserProps } from '@/domain/enterprise/entities/user.entity'
import { UpdateAccountUseCase } from './update-account.usecase'
import { makeUserData } from '@tests/factories/domain/make-user'

describe('UpdateAccountUseCase', () => {
  let sut: UpdateAccountUseCase
  let usersRepository: UsersRepository
  let passwordHasherStub: PasswordHasherStub
  let userData: UserProps
  let user: UserWithoutPassword

  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository()
    passwordHasherStub = new PasswordHasherStub()
    userData = makeUserData()
    user = await usersRepository.create(userData)
    sut = new UpdateAccountUseCase(usersRepository, passwordHasherStub)
  })

  it('should not update a nonexistent user', async () => {
    const request = { userId: 'any_inexistent_id' }
    await expect(sut.execute(request)).rejects.toThrowError('User not found')
  })

  it('should update the user account name', async () => {
    const request = {
      userId: user.id,
      name: 'new_name',
    }

    const response = await sut.execute(request)

    expect(response.id).toBe(user.id)
    expect(response.name).toBe('new_name')
    expect(response.email).toBe(user.email)
  })

  it('should update the user account email', async () => {
    const request = {
      userId: user.id,
      email: 'new_email',
    }

    const response = await sut.execute(request)

    expect(response.id).toBe(user.id)
    expect(response.email).toBe('new_email')
    expect(response.name).toBe(user.name)
  })

  it('should update the user account password', async () => {
    const newPassword = 'new_password'
    const request = {
      userId: user.id,
      password: newPassword,
    }

    const response = await sut.execute(request)

    const updatedUser = await usersRepository.findByEmail(user.email)
    expect(updatedUser).toBeDefined()
    expect(response.id).toEqual(updatedUser?.id)
    expect(response.name).toEqual(updatedUser?.name)
    expect(response.email).toEqual(updatedUser?.email)
    if (updatedUser) {
      await expect(passwordHasherStub.compare(userData.password, updatedUser.password)).resolves.toBe(false)
      await expect(passwordHasherStub.compare(newPassword, updatedUser.password)).resolves.toBe(true)
    }
  })

  it('should update the user account name and email', async () => {
    const request = {
      userId: user.id,
      name: 'new_name',
      email: 'new_email',
    }

    const response = await sut.execute(request)

    expect(response.id).toBe(user.id)
    expect(response.name).toBe('new_name')
    expect(response.email).toBe('new_email')
  })
})
