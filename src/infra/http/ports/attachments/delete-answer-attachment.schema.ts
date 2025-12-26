import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const deleteAnswerAttachmentParamsSchema = z.object({
  attachmentId: z.uuid(),
})

export class DeleteAnswerAttachmentParamsDto extends createZodDto(deleteAnswerAttachmentParamsSchema) {}
