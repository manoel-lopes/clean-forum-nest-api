import type { INestApplication } from '@nestjs/common'

import { aUser } from '@tests/builders/user.builder'
import { createUser, getUserByEmail } from '@tests/helpers/domain/enterprise/users/user-requests'
import { authenticateUser } from '@tests/helpers/infra/auth/authentication-requests'

import type { AuthenticatedUserResult, CreateUserOptions } from './types'

export async function createAuthenticatedUser (
  app: INestApplication,
  options?: CreateUserOptions
): Promise<AuthenticatedUserResult> {
  const builder = aUser()
  if (options?.name) builder.withName(options.name)
  if (options?.email) builder.withEmail(options.email)
  if (options?.password) builder.withPassword(options.password)

  const userData = builder.build()

  const createResponse = await createUser(app, userData)
  if (createResponse.statusCode !== 201) {
    throw new Error(`Failed to create user: ${JSON.stringify(createResponse.body)}`)
  }

  const authResponse = await authenticateUser(app, {
    email: userData.email,
    password: userData.password,
  })
  if (authResponse.statusCode !== 200) {
    throw new Error(`Failed to authenticate user: ${JSON.stringify(authResponse.body)}`)
  }

  const userResponse = await getUserByEmail(app, authResponse.body.token, {
    email: userData.email,
  })
  if (userResponse.statusCode !== 200) {
    throw new Error(`Failed to get user by email: ${JSON.stringify(userResponse.body)}`)
  }

  return {
    user: userResponse.body,
    token: authResponse.body.token,
    refreshTokenId: authResponse.body.refreshTokenId,
    credentials: {
      email: String(userData.email),
      password: String(userData.password),
    },
  }
}
