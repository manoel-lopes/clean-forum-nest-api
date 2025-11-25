import { aUser } from '@/../tests/builders/user.builder'
import type { INestApplication } from '@nestjs/common'
import { authenticateUser } from '@/../tests/helpers/infra/auth/authentication-requests'
import { createUser } from '@/../tests/helpers/domain/enterprise/users/user-requests'

export async function makeAuthToken (app: INestApplication) {
  const userData = aUser().build()
  await createUser(app, userData)
  const authResponse = await authenticateUser(app, {
    email: userData.email,
    password: userData.password,
  })
  return authResponse.body.token
}
