import { StorageServiceStub } from '@/infra/adapters/storage/stubs/storage-service.stub'
import type { StorageService } from '@/infra/adapters/storage/ports/storage-service'
import { InvalidAttachmentTypeException } from './exceptions/invalid-attachment-type.exception'
import { UploadAttachmentUseCase } from './upload-attachment.usecase'

describe('UploadAttachmentUseCase', () => {
  let sut: UploadAttachmentUseCase
  let storageService: StorageService

  beforeEach(() => {
    storageService = new StorageServiceStub()
    sut = new UploadAttachmentUseCase(storageService)
  })

  it('should upload a valid image file', async () => {
    const request = {
      fileName: 'test-image.png',
      fileType: 'image/png',
      body: Buffer.from('fake-image-content'),
    }

    const response = await sut.execute(request)

    expect(response.url).toContain('test-image.png')
    expect(response.key).toContain('test-image.png')
  })

  it('should upload a valid PDF file', async () => {
    const request = {
      fileName: 'document.pdf',
      fileType: 'application/pdf',
      body: Buffer.from('fake-pdf-content'),
    }

    const response = await sut.execute(request)

    expect(response.url).toContain('document.pdf')
    expect(response.key).toContain('document.pdf')
  })

  it('should throw error for invalid file type', async () => {
    const request = {
      fileName: 'malware.exe',
      fileType: 'application/x-msdownload',
      body: Buffer.from('fake-exe-content'),
    }

    await expect(sut.execute(request)).rejects.toThrow(
      new InvalidAttachmentTypeException('application/x-msdownload')
    )
  })

  it('should throw error for text file', async () => {
    const request = {
      fileName: 'readme.txt',
      fileType: 'text/plain',
      body: Buffer.from('some text content'),
    }

    await expect(sut.execute(request)).rejects.toThrow(InvalidAttachmentTypeException)
  })

  it.each([
    ['image/jpeg', 'photo.jpg'],
    ['image/png', 'image.png'],
    ['image/gif', 'animation.gif'],
    ['image/webp', 'modern.webp'],
    ['application/pdf', 'document.pdf'],
  ])('should accept %s file type', async (fileType, fileName) => {
    const request = {
      fileName,
      fileType,
      body: Buffer.from('file-content'),
    }

    const response = await sut.execute(request)

    expect(response.url).toBeDefined()
    expect(response.key).toBeDefined()
  })
})
