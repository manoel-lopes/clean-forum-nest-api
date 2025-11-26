import { INestApplication } from '@nestjs/common'

import { makeApp } from '@tests/helpers/app/make-app'
import { aUser } from '@tests/builders/user.builder'
import { createUser, deleteUser } from '@tests/helpers/domain/enterprise/users/user-requests'
import { authenticateUser } from '@tests/helpers/infra/auth/authentication-requests'

describe('DeleteAccountController (e2e)', () => {
  let app: INestApplication

  beforeAll(async () => {
    app = await makeApp()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should return 404 when user does not exist', async () => {
    const userData = aUser().build()
    await createUser(app, userData)
    const authResponse = await authenticateUser(app, {
      email: userData.email,
      password: userData.password,
    })
    const token = authResponse.body.token
    await deleteUser(app, token)

    const response = await deleteUser(app, token)

    expect(response.statusCode).toBe(404)
    expect(response.body).toEqual({
      statusCode: 404,
      error: 'Not Found',
      message: 'User not found',
    })
  })

  it('should return 204 and delete account', async () => {
    const userData = aUser().build()
    await createUser(app, userData)
    const authResponse = await authenticateUser(app, {
      email: userData.email,
      password: userData.password,
    })
    const token = authResponse.body.token

    const response = await deleteUser(app, token)

    expect(response.statusCode).toBe(204)
  })
})
