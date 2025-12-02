import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const deleteQuestionAttachmentParamsSchema = z.object({
  attachmentId: z.string().uuid(),
})

export class DeleteQuestionAttachmentParamsDto extends createZodDto(deleteQuestionAttachmentParamsSchema) {}
