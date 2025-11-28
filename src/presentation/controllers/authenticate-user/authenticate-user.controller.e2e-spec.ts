import { INestApplication } from '@nestjs/common'

import { AuthenticateUserUseCase } from '@/domain/application/usecases/authenticate-user/authenticate-user.usecase'
import { makeApp } from '@tests/helpers/app/make-app'
import { makeAppWithErrorStub } from '@tests/helpers/app/make-app-with-error-stub'
import { aUser } from '@tests/builders/user.builder'
import { createUser } from '@tests/helpers/domain/enterprise/users/user-requests'
import { authenticateUser } from '@tests/helpers/infra/auth/authentication-requests'

describe('AuthenticateUser', () => {
  let app: INestApplication

  beforeAll(async () => {
    app = await makeApp()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should return 401 when password is incorrect', async () => {
    const userData = aUser().build()
    await createUser(app, userData)

    const response = await authenticateUser(app, {
      email: userData.email,
      password: 'wrongpassword',
    })

    expect(response.statusCode).toBe(401)
    expect(response.body).toEqual({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Invalid password',
    })
  })

  it('should return 404 when user does not exist', async () => {
    const response = await authenticateUser(app, {
      email: 'nonexistent@example.com',
      password: 'password123',
    })

    expect(response.statusCode).toBe(404)
    expect(response.body).toEqual({
      statusCode: 404,
      error: 'Not Found',
      message: 'User not found',
    })
  })

  it('should return 500 when an unexpected error occurs', async () => {
    const appWithError = await makeAppWithErrorStub({
      useCaseClass: AuthenticateUserUseCase,
    })

    const response = await authenticateUser(appWithError, {
      email: 'test@example.com',
      password: 'Test@123',
    })

    expect(response.statusCode).toBe(500)
    expect(response.body).toEqual({
      statusCode: 500,
      message: 'Internal server error',
    })
    await appWithError.close()
  })

  it('should return 201 and authenticate user with token and refreshToken', async () => {
    const userData = aUser().build()
    await createUser(app, userData)

    const response = await authenticateUser(app, {
      email: userData.email,
      password: userData.password,
    })

    expect(response.statusCode).toBe(201)
    expect(response.body).toHaveProperty('token')
    expect(response.body).toHaveProperty('refreshToken')
  })
})
