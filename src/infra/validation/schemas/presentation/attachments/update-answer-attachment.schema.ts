import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const updateAnswerAttachmentParamsSchema = z.object({
  attachmentId: z.string().uuid(),
})

export const updateAnswerAttachmentBodySchema = z.object({
  title: z.string().min(1),
  url: z.string().url(),
})

export type UpdateAnswerAttachmentParams = z.infer<typeof updateAnswerAttachmentParamsSchema>

export type UpdateAnswerAttachmentBody = z.infer<typeof updateAnswerAttachmentBodySchema>

export class UpdateAnswerAttachmentParamsDto extends createZodDto(updateAnswerAttachmentParamsSchema) {}

export class UpdateAnswerAttachmentBodyDto extends createZodDto(updateAnswerAttachmentBodySchema) {}
