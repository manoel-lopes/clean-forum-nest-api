import type { UploadedFileData } from '@/infra/http/interceptors/fastify-file.interceptor'
import { FileValidator } from '../ports/file-validator'

export class MaxFileSizeValidator implements FileValidator {
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

  isValid (file: UploadedFileData): boolean {
    return file.buffer.length <= this.MAX_FILE_SIZE
  }

  buildErrorMessage (file: UploadedFileData): string {
    const maxSizeMB = (this.MAX_FILE_SIZE / (1024 * 1024)).toFixed(1)
    const fileSizeMB = (file.buffer.length / (1024 * 1024)).toFixed(2)
    return `File size ${fileSizeMB}MB exceeds maximum allowed size of ${maxSizeMB}MB`
  }
}
