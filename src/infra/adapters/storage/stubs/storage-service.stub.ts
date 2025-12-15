import type { StorageService, UploadParams, UploadResult } from '../ports/storage-service'

export class StorageServiceStub implements StorageService {
  private readonly uploads: Map<string, UploadParams> = new Map()

  async upload ({ fileName, fileType, body }: UploadParams): Promise<UploadResult> {
    const key = `fake-key-${fileName}`
    this.uploads.set(key, { fileName, fileType, body })
    return {
      url: `https://fake-bucket.s3.fake-region.amazonaws.com/${key}`,
      key,
    }
  }

  async delete (key: string): Promise<void> {
    this.uploads.delete(key)
  }
}
