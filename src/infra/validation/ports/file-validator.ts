import type { UploadedFileData } from '@/infra/http/interceptors/fastify-file.interceptor'

export type FileValidator = {
  isValid (file: UploadedFileData): boolean | Promise<boolean>
  buildErrorMessage (file: UploadedFileData): string
}
