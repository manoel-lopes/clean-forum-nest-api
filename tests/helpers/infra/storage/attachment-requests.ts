import type { INestApplication } from '@nestjs/common'
import request from 'supertest'

import { loadTestPng, loadTestJpeg } from './file-fixtures'

export type UploadAttachmentOptions = {
  fieldName?: string
  filename?: string
  contentType?: string
  buffer?: Buffer
}

export async function uploadAttachment (
  app: INestApplication,
  token: string | null,
  options?: UploadAttachmentOptions
) {
  const req = request(app.getHttpServer()).post('/attachments/upload')
  if (token) {
    req.set('Authorization', `Bearer ${token}`)
  }
  if (options?.fieldName || options?.buffer || options?.filename) {
    const fieldName = options.fieldName ?? 'file'
    const buffer = options.buffer ?? Buffer.from('fake-content')
    const attachOptions = options.contentType
      ? { filename: options.filename ?? 'test.png', contentType: options.contentType }
      : options.filename ?? 'test.png'
    req.attach(fieldName, buffer, attachOptions)
  }
  return req
}

export async function uploadAttachmentWithFormField (
  app: INestApplication,
  token: string,
  fieldName: string,
  fieldValue: string
) {
  return request(app.getHttpServer())
    .post('/attachments/upload')
    .set('Authorization', `Bearer ${token}`)
    .set('Content-Type', 'multipart/form-data')
    .field(fieldName, fieldValue)
}

export async function uploadTestPng (app: INestApplication, token: string | null) {
  const buffer = await loadTestPng()
  return uploadAttachment(app, token, {
    buffer,
    filename: 'test-image.png',
    contentType: 'image/png',
  })
}

export async function uploadTestJpeg (app: INestApplication, token: string | null) {
  const buffer = await loadTestJpeg()
  return uploadAttachment(app, token, {
    buffer,
    filename: 'test-image.jpg',
    contentType: 'image/jpeg',
  })
}
