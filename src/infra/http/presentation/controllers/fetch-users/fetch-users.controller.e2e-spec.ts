import { INestApplication } from '@nestjs/common'

import { makeApp } from '@tests/helpers/app/make-app'
import { fetchUsers } from '@tests/helpers/domain/enterprise/users/user-requests'
import { makeExpiredToken, signUp } from '@tests/helpers/infra/auth/authentication-requests'

describe('FetchUsers', () => {
  let app: INestApplication

  beforeAll(async () => {
    app = await makeApp()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should return 401 when no token is provided', async () => {
    const response = await fetchUsers(app, '')

    expect(response.statusCode).toBe(401)
    expect(response.body).toEqual({
      statusCode: 401,
      message: 'Invalid or missing authentication token',
      error: 'Unauthorized',
    })
  })

  it('should return 401 when invalid token is provided', async () => {
    const response = await fetchUsers(app, 'invalid-token')

    expect(response.statusCode).toBe(401)
    expect(response.body).toEqual({
      statusCode: 401,
      message: 'Invalid or missing authentication token',
      error: 'Unauthorized',
    })
  })

  it('should return 401 when token is expired', async () => {
    const expiredToken = makeExpiredToken(app)

    const response = await fetchUsers(app, expiredToken)

    expect(response.statusCode).toBe(401)
  })

  it('should return 200 and fetch users with pagination metadata', async () => {
    const { token } = await signUp(app)
    await signUp(app)
    await signUp(app)

    const response = await fetchUsers(app, token, { page: 1, pageSize: 2 })

    expect(response.statusCode).toBe(200)
    expect(response.body.items).toHaveLength(2)
    expect(response.body.page).toBe(1)
    expect(response.body.pageSize).toBe(2)
    expect(typeof response.body.totalItems).toBe('number')
    expect(response.body.totalItems).toBeGreaterThanOrEqual(3)
    expect(typeof response.body.totalPages).toBe('number')
    expect(response.body.totalPages).toBeGreaterThanOrEqual(2)
  })

  it('should return 200 and fetch different items on page change', async () => {
    const { token } = await signUp(app)
    await signUp(app)
    await signUp(app)

    const page1Response = await fetchUsers(app, token, { page: 1, pageSize: 2 })
    const page2Response = await fetchUsers(app, token, { page: 2, pageSize: 2 })

    expect(page1Response.statusCode).toBe(200)
    expect(page2Response.statusCode).toBe(200)
    expect(page1Response.body.page).toBe(1)
    expect(page2Response.body.page).toBe(2)
    expect(page1Response.body.pageSize).toBe(2)
    expect(page2Response.body.pageSize).toBe(2)
    expect(page1Response.body.totalItems).toBe(page2Response.body.totalItems)
    expect(page1Response.body.totalPages).toBe(page2Response.body.totalPages)
    expect(page1Response.body.items).toHaveLength(2)
    expect(page2Response.body.items.length).toBeGreaterThanOrEqual(1)
    const page1Ids = page1Response.body.items.map((item: { id: string }) => item.id)
    const page2Ids = page2Response.body.items.map((item: { id: string }) => item.id)
    const hasOverlap = page1Ids.some((id: string) => page2Ids.includes(id))
    expect(hasOverlap).toBe(false)
  })
})
