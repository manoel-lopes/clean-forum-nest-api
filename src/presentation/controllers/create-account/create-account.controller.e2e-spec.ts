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

  it('should return 400 when name is missing', async () => {
    const userData = aUser().withName(undefined).build()

    const response = await createUser(app, userData)

    expect(response.statusCode).toBe(400)
    expect(response.body.message).toBe('The name is required')
  })

  it('should return 400 when email is missing', async () => {
    const userData = aUser().withEmail(undefined).build()

    const response = await createUser(app, userData)

    expect(response.statusCode).toBe(400)
    expect(response.body.message).toBe('The email is required')
  })

  it('should return 400 when password is missing', async () => {
    const userData = aUser().withPassword(undefined).build()

    const response = await createUser(app, userData)

    expect(response.statusCode).toBe(400)
    expect(response.body.message).toBe('The password is required')
  })

  it('should return 422 when email is invalid', async () => {
    const userData = aUser().withEmail('invalid-email').build()

    const response = await createUser(app, userData)

    expect(response.statusCode).toBe(422)
  })

  it('should return 422 when password is too short', async () => {
    const userData = aUser().withPassword('Ab1@').build()

    const response = await createUser(app, userData)

    expect(response.statusCode).toBe(422)
  })

  it('should return 422 when password is too long', async () => {
    const userData = aUser().withPassword('Ab1@aaaaaaaaaa').build()

    const response = await createUser(app, userData)

    expect(response.statusCode).toBe(422)
  })

  it('should return 422 when password does not meet complexity requirements', async () => {
    const userData = aUser().withPassword('abcdef').build()

    const response = await createUser(app, userData)

    expect(response.statusCode).toBe(422)
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
