import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const attachmentSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  url: z.url(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export class AttachmentDto extends createZodDto(attachmentSchema) {}
