import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import type { NestFastifyApplication } from '@nestjs/platform-fastify'
import { FastifyAdapter } from '@nestjs/platform-fastify'
import multipart from '@fastify/multipart'
import request from 'supertest'
import { AppModule } from '@/app.module'
import { createAuthenticatedUser } from '@tests/helpers/e2e'
import { deleteUploadedFile } from '@tests/helpers/infra/storage/storage-cleanup'

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

  describe('Authentication', () => {
    it('should return 401 when no token is provided', async () => {
      const response = await request(app.getHttpServer())
        .post('/attachments/upload')
        .attach('file', Buffer.from('fake-image'), 'test.png')

      expect(response.statusCode).toBe(401)
    })

    it('should return 401 when token is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/attachments/upload')
        .set('Authorization', 'Bearer invalid-token')
        .attach('file', Buffer.from('fake-image'), {
          filename: 'test.png',
          contentType: 'image/png',
        })

      expect(response.statusCode).toBe(401)
    })

    it('should return 401 when token is expired', async () => {
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZXhwIjoxfQ.invalid'
      const response = await request(app.getHttpServer())
        .post('/attachments/upload')
        .set('Authorization', `Bearer ${expiredToken}`)
        .attach('file', Buffer.from('fake-image'), {
          filename: 'test.png',
          contentType: 'image/png',
        })

      expect(response.statusCode).toBe(401)
    })
  })

  describe('Request Format Validation', () => {
    it('should return 406 when request is not multipart', async () => {
      const response = await request(app.getHttpServer())
        .post('/attachments/upload')
        .set('Authorization', `Bearer ${token}`)

      expect(response.statusCode).toBe(406)
      expect(response.body.message).toBe('Request is not multipart')
    })

    it('should return 400 when no file is uploaded', async () => {
      const response = await request(app.getHttpServer())
        .post('/attachments/upload')
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'multipart/form-data')
        .field('someField', 'someValue')

      expect(response.statusCode).toBe(400)
      expect(response.body.message).toBe('No file uploaded')
    })

    it('should return 400 when wrong field name is used', async () => {
      const response = await request(app.getHttpServer())
        .post('/attachments/upload')
        .set('Authorization', `Bearer ${token}`)
        .attach('wrongFieldName', Buffer.from('fake-image'), {
          filename: 'test.png',
          contentType: 'image/png',
        })

      expect(response.statusCode).toBe(400)
      expect(response.body.message).toContain("Expected field name 'file'")
    })
  })

  describe('File Type Validation', () => {
    it('should return 400 when file type is executable', async () => {
      const response = await request(app.getHttpServer())
        .post('/attachments/upload')
        .set('Authorization', `Bearer ${token}`)
        .attach('file', Buffer.from('fake-content'), {
          filename: 'malware.exe',
          contentType: 'application/x-msdownload',
        })

      expect(response.statusCode).toBe(400)
      expect(response.body.message).toContain('is not allowed')
    })

    it('should return 400 when file type is plain text', async () => {
      const response = await request(app.getHttpServer())
        .post('/attachments/upload')
        .set('Authorization', `Bearer ${token}`)
        .attach('file', Buffer.from('plain text content'), {
          filename: 'readme.txt',
          contentType: 'text/plain',
        })

      expect(response.statusCode).toBe(400)
      expect(response.body.message).toContain('is not allowed')
    })

    it('should return 400 when file type is video', async () => {
      const response = await request(app.getHttpServer())
        .post('/attachments/upload')
        .set('Authorization', `Bearer ${token}`)
        .attach('file', Buffer.from('fake-video-content'), {
          filename: 'video.mp4',
          contentType: 'video/mp4',
        })

      expect(response.statusCode).toBe(400)
      expect(response.body.message).toContain('is not allowed')
    })

    it('should return 400 when file type is HTML', async () => {
      const response = await request(app.getHttpServer())
        .post('/attachments/upload')
        .set('Authorization', `Bearer ${token}`)
        .attach('file', Buffer.from('<html></html>'), {
          filename: 'page.html',
          contentType: 'text/html',
        })

      expect(response.statusCode).toBe(400)
      expect(response.body.message).toContain('is not allowed')
    })

    it('should return 400 when file type is JavaScript', async () => {
      const response = await request(app.getHttpServer())
        .post('/attachments/upload')
        .set('Authorization', `Bearer ${token}`)
        .attach('file', Buffer.from('console.log("test")'), {
          filename: 'script.js',
          contentType: 'application/javascript',
        })

      expect(response.statusCode).toBe(400)
      expect(response.body.message).toContain('is not allowed')
    })

    it('should return 400 when file type is ZIP archive', async () => {
      const response = await request(app.getHttpServer())
        .post('/attachments/upload')
        .set('Authorization', `Bearer ${token}`)
        .attach('file', Buffer.from('fake-zip-content'), {
          filename: 'archive.zip',
          contentType: 'application/zip',
        })

      expect(response.statusCode).toBe(400)
      expect(response.body.message).toContain('is not allowed')
    })
  })

  describe('File Size Validation', () => {
    it('should return 413 when file exceeds 5MB limit', async () => {
      const largeBuffer = Buffer.alloc(5 * 1024 * 1024 + 1)

      const response = await request(app.getHttpServer())
        .post('/attachments/upload')
        .set('Authorization', `Bearer ${token}`)
        .attach('file', largeBuffer, {
          filename: 'large-image.png',
          contentType: 'image/png',
        })

      expect(response.statusCode).toBe(413)
      expect(response.body.message).toContain('exceeds')
    })

    it('should upload file exactly at 5MB limit', async () => {
      const exactLimitBuffer = Buffer.alloc(5 * 1024 * 1024)

      const response = await request(app.getHttpServer())
        .post('/attachments/upload')
        .set('Authorization', `Bearer ${token}`)
        .attach('file', exactLimitBuffer, {
          filename: 'exact-limit.png',
          contentType: 'image/png',
        })

      expect(response.statusCode).toBe(201)
      expect(response.body).toHaveProperty('url')
      expect(response.body).toHaveProperty('key')

      await deleteUploadedFile(response.body.key)
    })
  })

  describe('Valid Image Uploads', () => {
    it('should upload PNG image and return 201', async () => {
      const response = await request(app.getHttpServer())
        .post('/attachments/upload')
        .set('Authorization', `Bearer ${token}`)
        .attach('file', Buffer.from('fake-png-content'), {
          filename: 'image.png',
          contentType: 'image/png',
        })

      expect(response.statusCode).toBe(201)
      expect(response.body).toHaveProperty('url')
      expect(response.body).toHaveProperty('key')
      expect(response.body.key).toContain('image.png')

      await deleteUploadedFile(response.body.key)
    })

    it('should upload JPEG image and return 201', async () => {
      const response = await request(app.getHttpServer())
        .post('/attachments/upload')
        .set('Authorization', `Bearer ${token}`)
        .attach('file', Buffer.from('fake-jpeg-content'), {
          filename: 'photo.jpg',
          contentType: 'image/jpeg',
        })

      expect(response.statusCode).toBe(201)
      expect(response.body).toHaveProperty('url')
      expect(response.body).toHaveProperty('key')
      expect(response.body.key).toContain('photo.jpg')

      await deleteUploadedFile(response.body.key)
    })

    it('should upload GIF image and return 201', async () => {
      const response = await request(app.getHttpServer())
        .post('/attachments/upload')
        .set('Authorization', `Bearer ${token}`)
        .attach('file', Buffer.from('fake-gif-content'), {
          filename: 'animation.gif',
          contentType: 'image/gif',
        })

      expect(response.statusCode).toBe(201)
      expect(response.body).toHaveProperty('url')
      expect(response.body).toHaveProperty('key')
      expect(response.body.key).toContain('animation.gif')

      await deleteUploadedFile(response.body.key)
    })

    it('should upload WebP image and return 201', async () => {
      const response = await request(app.getHttpServer())
        .post('/attachments/upload')
        .set('Authorization', `Bearer ${token}`)
        .attach('file', Buffer.from('fake-webp-content'), {
          filename: 'modern-image.webp',
          contentType: 'image/webp',
        })

      expect(response.statusCode).toBe(201)
      expect(response.body).toHaveProperty('url')
      expect(response.body).toHaveProperty('key')
      expect(response.body.key).toContain('modern-image.webp')

      await deleteUploadedFile(response.body.key)
    })
  })

  describe('Valid Document Uploads', () => {
    it('should upload PDF document and return 201', async () => {
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

  describe('Filename Edge Cases', () => {
    it('should handle filename with spaces', async () => {
      const response = await request(app.getHttpServer())
        .post('/attachments/upload')
        .set('Authorization', `Bearer ${token}`)
        .attach('file', Buffer.from('fake-content'), {
          filename: 'my file with spaces.png',
          contentType: 'image/png',
        })

      expect(response.statusCode).toBe(201)
      expect(response.body).toHaveProperty('url')
      expect(response.body).toHaveProperty('key')

      await deleteUploadedFile(response.body.key)
    })

    it('should handle filename with special characters', async () => {
      const response = await request(app.getHttpServer())
        .post('/attachments/upload')
        .set('Authorization', `Bearer ${token}`)
        .attach('file', Buffer.from('fake-content'), {
          filename: 'file-with_special.chars(1).png',
          contentType: 'image/png',
        })

      expect(response.statusCode).toBe(201)
      expect(response.body).toHaveProperty('url')
      expect(response.body).toHaveProperty('key')

      await deleteUploadedFile(response.body.key)
    })

    it('should handle filename with unicode characters', async () => {
      const response = await request(app.getHttpServer())
        .post('/attachments/upload')
        .set('Authorization', `Bearer ${token}`)
        .attach('file', Buffer.from('fake-content'), {
          filename: 'arquivo-em-portugues.png',
          contentType: 'image/png',
        })

      expect(response.statusCode).toBe(201)
      expect(response.body).toHaveProperty('url')
      expect(response.body).toHaveProperty('key')

      await deleteUploadedFile(response.body.key)
    })

    it('should handle very long filename', async () => {
      const longName = 'a'.repeat(200) + '.png'
      const response = await request(app.getHttpServer())
        .post('/attachments/upload')
        .set('Authorization', `Bearer ${token}`)
        .attach('file', Buffer.from('fake-content'), {
          filename: longName,
          contentType: 'image/png',
        })

      expect(response.statusCode).toBe(201)
      expect(response.body).toHaveProperty('url')
      expect(response.body).toHaveProperty('key')

      await deleteUploadedFile(response.body.key)
    })

    it('should handle filename with dots', async () => {
      const response = await request(app.getHttpServer())
        .post('/attachments/upload')
        .set('Authorization', `Bearer ${token}`)
        .attach('file', Buffer.from('fake-content'), {
          filename: 'file.name.with.dots.png',
          contentType: 'image/png',
        })

      expect(response.statusCode).toBe(201)
      expect(response.body).toHaveProperty('url')
      expect(response.body).toHaveProperty('key')

      await deleteUploadedFile(response.body.key)
    })

    it('should handle filename starting with dot', async () => {
      const response = await request(app.getHttpServer())
        .post('/attachments/upload')
        .set('Authorization', `Bearer ${token}`)
        .attach('file', Buffer.from('fake-content'), {
          filename: '.hidden-file.png',
          contentType: 'image/png',
        })

      expect(response.statusCode).toBe(201)
      expect(response.body).toHaveProperty('url')
      expect(response.body).toHaveProperty('key')

      await deleteUploadedFile(response.body.key)
    })
  })

  describe('Response Format', () => {
    it('should return url and key in response body', async () => {
      const response = await request(app.getHttpServer())
        .post('/attachments/upload')
        .set('Authorization', `Bearer ${token}`)
        .attach('file', Buffer.from('fake-content'), {
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

    it('should generate unique keys for same filename', async () => {
      const filename = 'duplicate-name.png'

      const response1 = await request(app.getHttpServer())
        .post('/attachments/upload')
        .set('Authorization', `Bearer ${token}`)
        .attach('file', Buffer.from('content-1'), {
          filename,
          contentType: 'image/png',
        })

      const response2 = await request(app.getHttpServer())
        .post('/attachments/upload')
        .set('Authorization', `Bearer ${token}`)
        .attach('file', Buffer.from('content-2'), {
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
})
