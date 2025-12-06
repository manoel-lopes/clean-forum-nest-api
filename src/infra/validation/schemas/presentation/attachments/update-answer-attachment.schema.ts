import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const updateAnswerAttachmentParamsSchema = z.object({
  attachmentId: z.uuid(),
})

export const updateAnswerAttachmentBodySchema = z.object({
  title: z.string().min(1),
  url: z.string().url(),
})

export class UpdateAnswerAttachmentParamsDto extends createZodDto(updateAnswerAttachmentParamsSchema) {}

export class UpdateAnswerAttachmentBodyDto extends createZodDto(updateAnswerAttachmentBodySchema) {}
