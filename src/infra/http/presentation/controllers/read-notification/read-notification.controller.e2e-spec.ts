import type { INestApplication } from '@nestjs/common'
import { PrismaService } from '@/infra/persistence/prisma.service'
import { makeApp } from '@tests/helpers/app/make-app'
import { aUser } from '@tests/builders/user.builder'
import { createUser } from '@tests/helpers/domain/enterprise/users/user-requests'
import { authenticateUser } from '@tests/helpers/infra/auth/authentication-requests'
import { readNotification } from '@tests/helpers/domain/notification/notification-requests'

describe('ReadNotification', () => {
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
    const response = await readNotification(app, '', 'notification-id')

    expect(response.statusCode).toBe(401)
    expect(response.body).toEqual({
      statusCode: 401,
      message: 'Invalid or missing authentication token',
      error: 'Unauthorized',
    })
  })

  it('should return 404 when notification does not exist', async () => {
    const userData = aUser().build()
    await createUser(app, userData)
    const authResponse = await authenticateUser(app, {
      email: userData.email,
      password: userData.password,
    })
    const token = authResponse.body.token

    const response = await readNotification(app, token, 'non-existent-id')

    expect(response.statusCode).toBe(404)
    expect(response.body).toEqual({
      statusCode: 404,
      error: 'Not Found',
      message: 'Notification not found',
    })
  })

  it('should return 403 when user is not the recipient', async () => {
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

    const notification = await prisma.notification.create({
      data: {
        recipientId: user1!.id,
        title: 'User 1 notification',
        content: 'Content',
      },
    })

    const response = await readNotification(app, user2Token, notification.id)

    expect(response.statusCode).toBe(403)
    expect(response.body).toEqual({
      statusCode: 403,
      error: 'Forbidden',
      message: 'User is not the recipient of this notification',
    })
  })

  it('should return 200 and mark notification as read', async () => {
    const userData = aUser().build()
    await createUser(app, userData)
    const authResponse = await authenticateUser(app, {
      email: userData.email,
      password: userData.password,
    })
    const token = authResponse.body.token
    const user = await prisma.user.findUnique({ where: { email: String(userData.email) } })

    const notification = await prisma.notification.create({
      data: {
        recipientId: user!.id,
        title: 'Test notification',
        content: 'Content',
      },
    })

    const response = await readNotification(app, token, notification.id)

    expect(response.statusCode).toBe(200)
    expect(response.body.readAt).toBeDefined()

    const updatedNotification = await prisma.notification.findUnique({
      where: { id: notification.id },
    })
    expect(updatedNotification?.readAt).toBeDefined()
  })
})
