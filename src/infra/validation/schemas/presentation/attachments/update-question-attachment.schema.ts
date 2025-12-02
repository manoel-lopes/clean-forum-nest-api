import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const updateQuestionAttachmentParamsSchema = z.object({
  attachmentId: z.string().uuid(),
})

export const updateQuestionAttachmentBodySchema = z.object({
  title: z.string().min(1),
  url: z.string().url(),
})

export class UpdateQuestionAttachmentParamsDto extends createZodDto(updateQuestionAttachmentParamsSchema) {}

export class UpdateQuestionAttachmentBodyDto extends createZodDto(updateQuestionAttachmentBodySchema) {}
