export class InvalidAttachmentTypeError extends Error {
  constructor (fileType: string) {
    super(`Invalid attachment type: ${fileType}`)
  }
}
