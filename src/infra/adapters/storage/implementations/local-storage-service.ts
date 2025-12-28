import { randomUUID } from 'node:crypto'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import { Injectable } from '@nestjs/common'
import type { StorageService, UploadParams, UploadResult } from '../ports/storage-service'

@Injectable()
export class LocalStorageService implements StorageService {
  private readonly uploadDir = './uploads'

  async upload ({ fileName, body }: UploadParams): Promise<UploadResult> {
    const key = `${randomUUID()}-${fileName}`
    const filePath = path.join(this.uploadDir, key)
    await fs.mkdir(this.uploadDir, { recursive: true })
    await fs.writeFile(filePath, body)
    return {
      url: `/uploads/${key}`,
      key,
    }
  }

  async delete (key: string): Promise<void> {
    const filePath = path.join(this.uploadDir, key)
    await fs.unlink(filePath)
  }
}
