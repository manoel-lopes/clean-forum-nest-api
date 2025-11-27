import { INestApplication } from '@nestjs/common'

import { makeApp } from '@tests/helpers/app/make-app'
import { aUser } from '@tests/builders/user.builder'
import { createUser } from '@tests/helpers/domain/enterprise/users/user-requests'

describe('CreateAccount', () => {
  let app: INestApplication

  beforeAll(async () => {
    app = await makeApp()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should return 409 when email already exists', async () => {
    const userData = aUser().build()

    await createUser(app, userData)
    const response = await createUser(app, userData)

    expect(response.statusCode).toBe(409)
    expect(response.body).toEqual({
      statusCode: 409,
      error: 'Conflict',
      message: 'User with email already registered',
    })
  })

  it('should return 201 and create a new account', async () => {
    const userData = aUser().build()

    const response = await createUser(app, userData)

    expect(response.statusCode).toBe(201)
  })
})
