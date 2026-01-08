import type { UploadedFileData } from '@/infra/http/presentation/interceptors/fastify-file.interceptor'
import { FileValidator } from '../ports/file-validator'

export class FileTypeValidator implements FileValidator {
  private readonly fileType = /^(image\/(jpeg|png|gif|webp)|application\/pdf)$/
  isValid (file: UploadedFileData): boolean {
    return this.fileType.test(file.mimetype)
  }

  buildErrorMessage (file: UploadedFileData): string {
    return `File type '${file.mimetype}' is not allowed`
  }
}
