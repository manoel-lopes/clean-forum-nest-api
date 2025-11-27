import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const deleteQuestionAttachmentParamsSchema = z.object({
  attachmentId: z.string().uuid(),
})

export type DeleteQuestionAttachmentParams = z.infer<typeof deleteQuestionAttachmentParamsSchema>

export class DeleteQuestionAttachmentParamsDto extends createZodDto(deleteQuestionAttachmentParamsSchema) {}
