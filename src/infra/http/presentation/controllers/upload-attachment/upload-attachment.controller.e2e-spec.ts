import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import type { NestFastifyApplication } from '@nestjs/platform-fastify'
import { FastifyAdapter } from '@nestjs/platform-fastify'
import multipart from '@fastify/multipart'

import { AppModule } from '@/app.module'
import { createAuthenticatedUser } from '@tests/helpers/e2e'
import { deleteUploadedFile } from '@tests/helpers/infra/storage/storage-cleanup'
import {
  uploadAttachment,
  uploadAttachmentWithFormField,
  uploadTestPng,
  uploadTestJpeg,
} from '@tests/helpers/infra/storage/attachment-requests'
import { loadTestPng } from '@tests/helpers/infra/storage/file-fixtures'
import { makeExpiredToken } from '@tests/helpers/infra/auth/authentication-requests'

describe('UploadAttachment', () => {
  let app: INestApplication
  let token: string

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

    const authResult = await createAuthenticatedUser(app)
    token = authResult.token
  })

  afterAll(async () => {
    await app.close()
  })

  it('[Authentication] should return 401 when no token is provided', async () => {
    const response = await uploadTestPng(app, null)

    expect(response.statusCode).toBe(401)
  })

  it('[Authentication] should return 401 when token is invalid', async () => {
    const response = await uploadTestPng(app, 'invalid-token')

    expect(response.statusCode).toBe(401)
  })

  it('[Authentication] should return 401 when token is malformed', async () => {
    const response = await uploadTestPng(app, 'malformed-token')

    expect(response.statusCode).toBe(401)
  })

  it('[Authentication] should return 401 when token is expired', async () => {
    const expiredToken = makeExpiredToken(app)
    const response = await uploadTestPng(app, expiredToken)

    expect(response.statusCode).toBe(401)
  })

  it('[Request Format] should return 406 when request is not multipart', async () => {
    const response = await uploadAttachment(app, token)

    expect(response.statusCode).toBe(406)
    expect(response.body.message).toBe('Request is not multipart')
  })

  it('[Request Format] should return 400 when no file is uploaded', async () => {
    const response = await uploadAttachmentWithFormField(app, token, 'someField', 'someValue')

    expect(response.statusCode).toBe(400)
    expect(response.body.message).toBe('No file uploaded')
  })

  it('[Request Format] should return 400 when wrong field name is used', async () => {
    const response = await uploadAttachment(app, token, {
      fieldName: 'wrongFieldName',
      buffer: await loadTestPng(),
      filename: 'test.png',
      contentType: 'image/png',
    })

    expect(response.statusCode).toBe(400)
    expect(response.body.message).toContain("Expected field name 'file'")
  })

  it('[File Type] should return 400 when file type is executable', async () => {
    const response = await uploadAttachment(app, token, {
      buffer: Buffer.from('fake-content'),
      filename: 'malware.exe',
      contentType: 'application/x-msdownload',
    })

    expect(response.statusCode).toBe(400)
    expect(response.body.message).toContain('is not allowed')
  })

  it('[File Type] should return 400 when file type is plain text', async () => {
    const response = await uploadAttachment(app, token, {
      buffer: Buffer.from('plain text content'),
      filename: 'readme.txt',
      contentType: 'text/plain',
    })

    expect(response.statusCode).toBe(400)
    expect(response.body.message).toContain('is not allowed')
  })

  it('[File Type] should return 400 when file type is video', async () => {
    const response = await uploadAttachment(app, token, {
      buffer: Buffer.from('fake-video-content'),
      filename: 'video.mp4',
      contentType: 'video/mp4',
    })

    expect(response.statusCode).toBe(400)
    expect(response.body.message).toContain('is not allowed')
  })

  it('[File Type] should return 400 when file type is HTML', async () => {
    const response = await uploadAttachment(app, token, {
      buffer: Buffer.from('<html></html>'),
      filename: 'page.html',
      contentType: 'text/html',
    })

    expect(response.statusCode).toBe(400)
    expect(response.body.message).toContain('is not allowed')
  })

  it('[File Type] should return 400 when file type is JavaScript', async () => {
    const response = await uploadAttachment(app, token, {
      buffer: Buffer.from('console.log("test")'),
      filename: 'script.js',
      contentType: 'application/javascript',
    })

    expect(response.statusCode).toBe(400)
    expect(response.body.message).toContain('is not allowed')
  })

  it('[File Type] should return 400 when file type is ZIP archive', async () => {
    const response = await uploadAttachment(app, token, {
      buffer: Buffer.from('fake-zip-content'),
      filename: 'archive.zip',
      contentType: 'application/zip',
    })

    expect(response.statusCode).toBe(400)
    expect(response.body.message).toContain('is not allowed')
  })

  it('[File Size] should return 413 when file exceeds 5MB limit', async () => {
    const largeBuffer = Buffer.alloc(5 * 1024 * 1024 + 1)

    const response = await uploadAttachment(app, token, {
      buffer: largeBuffer,
      filename: 'large-image.png',
      contentType: 'image/png',
    })

    expect(response.statusCode).toBe(413)
    expect(response.body.message).toContain('exceeds')
  })

  it('[File Size] should upload file exactly at 5MB limit', async () => {
    const exactLimitBuffer = Buffer.alloc(5 * 1024 * 1024)

    const response = await uploadAttachment(app, token, {
      buffer: exactLimitBuffer,
      filename: 'exact-limit.png',
      contentType: 'image/png',
    })

    expect(response.statusCode).toBe(201)
    expect(response.body).toHaveProperty('url')
    expect(response.body).toHaveProperty('key')

    await deleteUploadedFile(response.body.key)
  })

  it('[Valid Upload] should upload PNG image and return 201', async () => {
    const response = await uploadTestPng(app, token)

    expect(response.statusCode).toBe(201)
    expect(response.body).toHaveProperty('url')
    expect(response.body).toHaveProperty('key')
    expect(response.body.key).toContain('.png')

    await deleteUploadedFile(response.body.key)
  })

  it('[Valid Upload] should upload JPEG image and return 201', async () => {
    const response = await uploadTestJpeg(app, token)

    expect(response.statusCode).toBe(201)
    expect(response.body).toHaveProperty('url')
    expect(response.body).toHaveProperty('key')
    expect(response.body.key).toContain('.jpg')

    await deleteUploadedFile(response.body.key)
  })

  it('[Filename] should handle filename with spaces', async () => {
    const response = await uploadAttachment(app, token, {
      buffer: await loadTestPng(),
      filename: 'my file with spaces.png',
      contentType: 'image/png',
    })

    expect(response.statusCode).toBe(201)
    expect(response.body).toHaveProperty('url')
    expect(response.body).toHaveProperty('key')

    await deleteUploadedFile(response.body.key)
  })

  it('[Filename] should handle filename with special characters', async () => {
    const response = await uploadAttachment(app, token, {
      buffer: await loadTestPng(),
      filename: 'file-with_special.chars(1).png',
      contentType: 'image/png',
    })

    expect(response.statusCode).toBe(201)
    expect(response.body).toHaveProperty('url')
    expect(response.body).toHaveProperty('key')

    await deleteUploadedFile(response.body.key)
  })

  it('[Response] should return url and key in response body', async () => {
    const response = await uploadAttachment(app, token, {
      buffer: await loadTestPng(),
      filename: 'test-response.png',
      contentType: 'image/png',
    })

    expect(response.statusCode).toBe(201)
    expect(response.body).toEqual({
      url: expect.any(String),
      key: expect.any(String),
    })
    expect(response.body.url).toBeTruthy()
    expect(response.body.key).toBeTruthy()
    expect(response.body.key).toContain('test-response.png')

    await deleteUploadedFile(response.body.key)
  })

  it('[Response] should generate unique keys for same filename', async () => {
    const filename = 'duplicate-name.png'
    const pngBuffer = await loadTestPng()

    const response1 = await uploadAttachment(app, token, {
      buffer: pngBuffer,
      filename,
      contentType: 'image/png',
    })

    const response2 = await uploadAttachment(app, token, {
      buffer: pngBuffer,
      filename,
      contentType: 'image/png',
    })

    expect(response1.statusCode).toBe(201)
    expect(response2.statusCode).toBe(201)
    expect(response1.body.key).not.toBe(response2.body.key)

    await deleteUploadedFile(response1.body.key)
    await deleteUploadedFile(response2.body.key)
  })
})
