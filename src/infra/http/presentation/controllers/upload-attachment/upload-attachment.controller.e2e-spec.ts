import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import type { NestFastifyApplication } from '@nestjs/platform-fastify'
import { FastifyAdapter } from '@nestjs/platform-fastify'
import multipart from '@fastify/multipart'
import request from 'supertest'
import { AppModule } from '@/app.module'
import { aUser } from '@tests/builders/user.builder'
import { createUser } from '@tests/helpers/domain/enterprise/users/user-requests'
import { authenticateUser } from '@tests/helpers/infra/auth/authentication-requests'
import { deleteUploadedFile } from '@tests/helpers/infra/storage/storage-cleanup'

describe('UploadAttachment', () => {
  let app: INestApplication

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    const fastifyAdapter = new FastifyAdapter({ logger: false })
    app = moduleRef.createNestApplication<NestFastifyApplication>(fastifyAdapter)
    await fastifyAdapter.getInstance().register(multipart, {
      limits: { fileSize: 5 * 1024 * 1024 },
    })
    await app.init()
    await app.getHttpAdapter().getInstance().ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should return 401 when no token is provided', async () => {
    const response = await request(app.getHttpServer())
      .post('/attachments/upload')
      .attach('file', Buffer.from('fake-image'), 'test.png')

    expect(response.statusCode).toBe(401)
  })

  it('should return 406 when request is not multipart', async () => {
    const userData = aUser().build()
    await createUser(app, userData)
    const authResponse = await authenticateUser(app, {
      email: userData.email,
      password: userData.password,
    })
    const token = authResponse.body.token

    const response = await request(app.getHttpServer())
      .post('/attachments/upload')
      .set('Authorization', `Bearer ${token}`)

    expect(response.statusCode).toBe(406)
  })

  it('should return 400 when file type is invalid', async () => {
    const userData = aUser().build()
    await createUser(app, userData)
    const authResponse = await authenticateUser(app, {
      email: userData.email,
      password: userData.password,
    })
    const token = authResponse.body.token

    const response = await request(app.getHttpServer())
      .post('/attachments/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', Buffer.from('fake-content'), {
        filename: 'test.exe',
        contentType: 'application/x-msdownload',
      })

    expect(response.statusCode).toBe(400)
    expect(response.body.message).toContain('Invalid attachment type')
  })

  it('should upload a valid image file and return 201', async () => {
    const userData = aUser().build()
    await createUser(app, userData)
    const authResponse = await authenticateUser(app, {
      email: userData.email,
      password: userData.password,
    })
    const token = authResponse.body.token

    const response = await request(app.getHttpServer())
      .post('/attachments/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', Buffer.from('fake-image-content'), {
        filename: 'test-image.png',
        contentType: 'image/png',
      })

    expect(response.statusCode).toBe(201)
    expect(response.body).toHaveProperty('url')
    expect(response.body).toHaveProperty('key')
    expect(response.body.key).toContain('test-image.png')

    await deleteUploadedFile(response.body.key)
  })

  it('should upload a valid PDF file and return 201', async () => {
    const userData = aUser().build()
    await createUser(app, userData)
    const authResponse = await authenticateUser(app, {
      email: userData.email,
      password: userData.password,
    })
    const token = authResponse.body.token

    const response = await request(app.getHttpServer())
      .post('/attachments/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', Buffer.from('fake-pdf-content'), {
        filename: 'document.pdf',
        contentType: 'application/pdf',
      })

    expect(response.statusCode).toBe(201)
    expect(response.body).toHaveProperty('url')
    expect(response.body).toHaveProperty('key')
    expect(response.body.key).toContain('document.pdf')

    await deleteUploadedFile(response.body.key)
  })
})
