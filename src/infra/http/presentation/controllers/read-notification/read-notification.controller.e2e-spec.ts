import type { INestApplication } from '@nestjs/common'
import { PrismaService } from '@/infra/persistence/prisma.service'
import { makeApp } from '@tests/helpers/app/make-app'
import { makeExpiredToken, signUp } from '@tests/helpers/infra/auth/authentication-requests'
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

  it('should return 401 when token is expired', async () => {
    const expiredToken = makeExpiredToken(app)
    const response = await readNotification(app, expiredToken, 'notification-id')

    expect(response.statusCode).toBe(401)
  })

  it('should return 404 when notification does not exist', async () => {
    const { token } = await signUp(app)

    const response = await readNotification(app, token, 'non-existent-id')

    expect(response.statusCode).toBe(404)
    expect(response.body).toEqual({
      statusCode: 404,
      error: 'Not Found',
      message: 'Notification not found',
    })
  })

  it('should return 403 when user is not the recipient', async () => {
    const { userId: user1Id } = await signUp(app)
    const { token: user2Token } = await signUp(app)

    const notification = await prisma.notification.create({
      data: {
        recipientId: user1Id,
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
    const { token, userId } = await signUp(app)

    const notification = await prisma.notification.create({
      data: {
        recipientId: userId,
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
