import { INestApplication } from '@nestjs/common'
import { aUser } from '@tests/builders/user.builder'
import { makeApp } from '@tests/helpers/app/make-app'
import { createUser, fetchUsers } from '@tests/helpers/domain/enterprise/users/user-requests'
import { authenticateUser } from '@tests/helpers/infra/auth/authentication-requests'

describe('FetchUsers', () => {
  let app: INestApplication
  beforeAll(async () => {
    app = await makeApp()
  })
  afterAll(async () => {
    await app.close()
  })
  it('should return 200 and fetch users with pagination', async () => {
    const userData = aUser().build()
    await createUser(app, userData)
    const authResponse = await authenticateUser(app, {
      email: userData.email,
      password: userData.password,
    })
    const token = authResponse.body.token
    const response = await fetchUsers(app, token)
    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('items')
    expect(response.body).toHaveProperty('page')
    expect(response.body).toHaveProperty('pageSize')
    expect(response.body).toHaveProperty('totalItems')
    expect(response.body).toHaveProperty('totalPages')
    expect(Array.isArray(response.body.items)).toBe(true)
  })
  it('should return 200 and fetch users with custom page and pageSize', async () => {
    const userData = aUser().build()
    await createUser(app, userData)
    const authResponse = await authenticateUser(app, {
      email: userData.email,
      password: userData.password,
    })
    const token = authResponse.body.token
    const response = await fetchUsers(app, token, { page: 1, pageSize: 5 })
    expect(response.statusCode).toBe(200)
    expect(response.body.page).toBe(1)
    expect(response.body.pageSize).toBe(5)
  })
})
