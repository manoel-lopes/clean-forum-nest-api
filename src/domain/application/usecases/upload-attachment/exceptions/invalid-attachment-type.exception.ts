export class InvalidAttachmentTypeException extends Error {
  constructor (fileType: string) {
    super(`Invalid attachment type: ${fileType}`)
  }
}
