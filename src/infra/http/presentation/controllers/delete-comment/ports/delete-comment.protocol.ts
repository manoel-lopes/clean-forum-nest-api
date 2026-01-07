import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const deleteCommentParamsSchema = z.object({
  commentId: z.uuid(),
})

export type DeleteCommentParams = z.infer<typeof deleteCommentParamsSchema>

export class DeleteCommentParamsDto extends createZodDto(deleteCommentParamsSchema) {}
