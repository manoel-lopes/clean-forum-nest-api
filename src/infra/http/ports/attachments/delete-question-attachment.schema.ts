import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const deleteQuestionAttachmentParamsSchema = z.object({
  attachmentId: z.uuid(),
})

export class DeleteQuestionAttachmentParamsDto extends createZodDto(deleteQuestionAttachmentParamsSchema) {}
