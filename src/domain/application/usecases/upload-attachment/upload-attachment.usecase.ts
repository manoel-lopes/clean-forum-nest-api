import { Inject, Injectable } from '@nestjs/common'
import { UseCase } from '@/core/domain/use-case'
import { StorageService } from '@/infra/adapters/storage/ports/storage-service'
import { InvalidAttachmentTypeError } from './errors/invalid-attachment-type.error'

type UploadAttachmentRequest = {
  fileName: string
  fileType: string
  body: Buffer
}

type UploadAttachmentResponse = {
  url: string
  key: string
}

const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
]

@Injectable()
export class UploadAttachmentUseCase implements UseCase {
  constructor (
    @Inject(StorageService) private readonly storageService: StorageService
  ) {}

  async execute (request: UploadAttachmentRequest): Promise<UploadAttachmentResponse> {
    const { fileName, fileType, body } = request
    if (!ALLOWED_FILE_TYPES.includes(fileType)) {
      throw new InvalidAttachmentTypeError(fileType)
    }
    const { url, key } = await this.storageService.upload({ fileName, fileType, body })
    return { url, key }
  }
}
