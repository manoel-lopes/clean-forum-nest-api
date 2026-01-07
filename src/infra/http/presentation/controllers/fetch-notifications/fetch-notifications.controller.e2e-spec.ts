import type { INestApplication } from '@nestjs/common'
import { PrismaService } from '@/infra/persistence/prisma.service'
import { makeApp } from '@tests/helpers/app/make-app'
import { aUser } from '@tests/builders/user.builder'
import { createUser } from '@tests/helpers/domain/enterprise/users/user-requests'
import { authenticateUser } from '@tests/helpers/infra/auth/authentication-requests'
import { fetchNotifications } from '@tests/helpers/domain/notification/notification-requests'

describe('FetchNotifications', () => {
  let app: INestApplication
  let prisma: PrismaService

  beforeAll(async () => {
    app = await makeApp()
    prisma = app.get(PrismaService)
  })

  afterAll(async () => {
    await app.close()
  })

  it('should return 401 when no token is provided', async () => {
    const response = await fetchNotifications(app, '')

    expect(response.statusCode).toBe(401)
    expect(response.body).toEqual({
      statusCode: 401,
      message: 'Invalid or missing authentication token',
      error: 'Unauthorized',
    })
  })

  it('should return 200 and empty array when user has no notifications', async () => {
    const userData = aUser().build()
    await createUser(app, userData)
    const authResponse = await authenticateUser(app, {
      email: userData.email,
      password: userData.password,
    })
    const token = authResponse.body.token

    const response = await fetchNotifications(app, token)

    expect(response.statusCode).toBe(200)
    expect(response.body.items).toEqual([])
    expect(response.body.totalItems).toBe(0)
  })

  it('should return 200 and notifications for current user', async () => {
    const userData = aUser().build()
    await createUser(app, userData)
    const authResponse = await authenticateUser(app, {
      email: userData.email,
      password: userData.password,
    })
    const token = authResponse.body.token
    const user = await prisma.user.findUnique({ where: { email: String(userData.email) } })

    await prisma.notification.create({
      data: {
        recipientId: user!.id,
        title: 'Test notification',
        content: 'Test content',
      },
    })

    const response = await fetchNotifications(app, token)

    expect(response.statusCode).toBe(200)
    expect(response.body.items).toHaveLength(1)
    expect(response.body.items[0].title).toBe('Test notification')
    expect(response.body.totalItems).toBe(1)
  })

  it('should return paginated results', async () => {
    const userData = aUser().build()
    await createUser(app, userData)
    const authResponse = await authenticateUser(app, {
      email: userData.email,
      password: userData.password,
    })
    const token = authResponse.body.token
    const user = await prisma.user.findUnique({ where: { email: String(userData.email) } })

    for (let i = 0; i < 15; i++) {
      await prisma.notification.create({
        data: {
          recipientId: user!.id,
          title: `Notification ${i}`,
          content: 'Content',
        },
      })
    }

    const response = await fetchNotifications(app, token, { page: 1, pageSize: 10 })

    expect(response.statusCode).toBe(200)
    expect(response.body.items).toHaveLength(10)
    expect(response.body.totalItems).toBe(15)
    expect(response.body.totalPages).toBe(2)
  })

  it('should not return notifications from other users', async () => {
    const user1Data = aUser().build()
    const user2Data = aUser().build()
    await createUser(app, user1Data)
    await createUser(app, user2Data)
    await authenticateUser(app, {
      email: user1Data.email,
      password: user1Data.password,
    })
    const auth2Response = await authenticateUser(app, {
      email: user2Data.email,
      password: user2Data.password,
    })
    const user1 = await prisma.user.findUnique({ where: { email: String(user1Data.email) } })
    const user2Token = auth2Response.body.token

    await prisma.notification.create({
      data: {
        recipientId: user1!.id,
        title: 'User 1 notification',
        content: 'Content',
      },
    })

    const response = await fetchNotifications(app, user2Token)

    expect(response.statusCode).toBe(200)
    expect(response.body.items).toHaveLength(0)
  })
})
