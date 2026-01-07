import { INestApplication } from '@nestjs/common'

import { makeApp } from '@tests/helpers/app/make-app'
import { getUserByEmail } from '@tests/helpers/domain/enterprise/users/user-requests'
import { signUp } from '@tests/helpers/infra/auth/authentication-requests'

describe('GetUserByEmail', () => {
  let app: INestApplication

  beforeAll(async () => {
    app = await makeApp()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should return 422 when email is not a valid email format', async () => {
    const response = await getUserByEmail(app, '', { email: 'invalid-email' })

    expect(response.statusCode).toBe(422)
    expect(response.body).toEqual({
      statusCode: 422,
      error: 'Unprocessable Entity',
      message: "The 'email' must be a valid email address",
    })
  })

  it('should return 404 when user with email does not exist', async () => {
    const { token } = await signUp(app)

    const response = await getUserByEmail(app, token, { email: 'nonexistent@example.com' })

    expect(response.statusCode).toBe(404)
    expect(response.body).toEqual({
      statusCode: 404,
      error: 'Not Found',
      message: 'User not found',
    })
  })

  it('should return 200 and get user by email', async () => {
    const { token, user } = await signUp(app)

    const response = await getUserByEmail(app, token, { email: user.email })

    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('id')
    expect(response.body).toHaveProperty('name')
    expect(response.body).toHaveProperty('email')
    expect(response.body.email).toBe(user.email)
  })
})
