import { ApiProperty } from '@nestjs/swagger'

export class UploadAttachmentBodyDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'File to upload (max 5MB). Allowed types: jpeg, png, gif, webp, pdf',
  })
  file!: unknown
}
