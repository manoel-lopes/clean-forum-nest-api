import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const attachmentParamsSchema = z.object({
  attachmentId: z.uuid(),
})

export const updateAttachmentBodySchema = z.object({
  title: z.string().min(1),
  url: z.url(),
})

export class AttachmentParamsDto extends createZodDto(attachmentParamsSchema) {}

export class UpdateAttachmentBodyDto extends createZodDto(updateAttachmentBodySchema) {}
