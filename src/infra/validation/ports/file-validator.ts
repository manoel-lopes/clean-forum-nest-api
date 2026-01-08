import type { UploadedFileData } from '@/infra/http/presentation/interceptors/fastify-file.interceptor'

export type FileValidator = {
  isValid (file: UploadedFileData): boolean | Promise<boolean>
  buildErrorMessage (file: UploadedFileData): string
}
