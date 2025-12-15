export type UploadParams = {
  fileName: string
  fileType: string
  body: Buffer
}

export type UploadResult = {
  url: string
  key: string
}

export type StorageService = {
  upload: (params: UploadParams) => Promise<UploadResult>
  delete: (key: string) => Promise<void>
}

export const StorageService = Symbol('StorageService')
