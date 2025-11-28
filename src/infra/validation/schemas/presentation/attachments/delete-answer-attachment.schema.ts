import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const deleteAnswerAttachmentParamsSchema = z.object({
  attachmentId: z.string().uuid(),
})

export type DeleteAnswerAttachmentParams = z.infer<typeof deleteAnswerAttachmentParamsSchema>

export class DeleteAnswerAttachmentParamsDto extends createZodDto(deleteAnswerAttachmentParamsSchema) {}
