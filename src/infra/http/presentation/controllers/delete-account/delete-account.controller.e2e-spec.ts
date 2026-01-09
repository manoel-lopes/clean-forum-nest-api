import { INestApplication } from '@nestjs/common'

import { DeleteAccountUseCase } from '@/domain/application/usecases/delete-account/delete-account.usecase'
import { makeApp } from '@tests/helpers/app/make-app'
import { makeAppWithErrorStub } from '@tests/helpers/app/make-app-with-error-stub'
import { deleteUser } from '@tests/helpers/domain/enterprise/users/user-requests'
import { makeExpiredToken, signUp } from '@tests/helpers/infra/auth/authentication-requests'

describe('DeleteAccount', () => {
  let app: INestApplication

  beforeAll(async () => {
    app = await makeApp()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should return 401 when no token is provided', async () => {
    const response = await deleteUser(app, '')

    expect(response.statusCode).toBe(401)
    expect(response.body).toEqual({
      statusCode: 401,
      message: 'Invalid or missing authentication token',
      error: 'Unauthorized',
    })
  })

  it('should return 401 when invalid token is provided', async () => {
    const response = await deleteUser(app, 'invalid-token')

    expect(response.statusCode).toBe(401)
    expect(response.body).toEqual({
      statusCode: 401,
      message: 'Invalid or missing authentication token',
      error: 'Unauthorized',
    })
  })

  it('should return 401 when token is expired', async () => {
    const expiredToken = makeExpiredToken(app)

    const response = await deleteUser(app, expiredToken)

    expect(response.statusCode).toBe(401)
  })

  it('should return 404 when user does not exist', async () => {
    const { token } = await signUp(app)
    await deleteUser(app, token)

    const response = await deleteUser(app, token)

    expect(response.statusCode).toBe(404)
    expect(response.body).toEqual({
      statusCode: 404,
      error: 'Not Found',
      message: 'User not found',
    })
  })

  it('should return 500 if an unexpected error occurs', async () => {
    const appWithError = await makeAppWithErrorStub({
      useCaseClass: DeleteAccountUseCase,
    })
    const { token } = await signUp(appWithError)

    const response = await deleteUser(appWithError, token)

    expect(response.statusCode).toBe(500)
    expect(response.body).toEqual({
      statusCode: 500,
      message: 'Internal server error',
    })
    await appWithError.close()
  })

  it('should return 204 and delete account', async () => {
    const { token } = await signUp(app)

    const response = await deleteUser(app, token)

    expect(response.statusCode).toBe(204)
  })
})
