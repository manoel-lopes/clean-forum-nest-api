import { randomUUID } from 'node:crypto'
import { Injectable } from '@nestjs/common'
import { EnvService } from '@/infra/env/env.service'
import type { StorageService, UploadParams, UploadResult } from '../ports/storage-service'
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

@Injectable()
export class S3StorageService implements StorageService {
  private readonly client: S3Client

  constructor (private readonly envService: EnvService) {
    this.client = new S3Client({
      region: this.envService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.envService.get('AWS_ACCESS_KEY_ID') ?? '',
        secretAccessKey: this.envService.get('AWS_SECRET_ACCESS_KEY') ?? '',
      },
    })
  }

  async upload ({ fileName, fileType, body }: UploadParams): Promise<UploadResult> {
    const key = `${randomUUID()}-${fileName}`
    const bucket = this.envService.get('AWS_BUCKET_NAME')
    const region = this.envService.get('AWS_REGION')
    await this.client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: fileType,
        Body: body,
      })
    )
    return {
      url: `https://${bucket}.s3.${region}.amazonaws.com/${key}`,
      key,
    }
  }

  async delete (key: string): Promise<void> {
    const bucket = this.envService.get('AWS_BUCKET_NAME')
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    )
  }
}
