import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const attachmentSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  url: z.string().url(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export class AttachmentDto extends createZodDto(attachmentSchema) {}
