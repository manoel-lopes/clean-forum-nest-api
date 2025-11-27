import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const deleteCommentParamsSchema = z.object({
  commentId: z.string().uuid(),
})

export type DeleteCommentParams = z.infer<typeof deleteCommentParamsSchema>

export class DeleteCommentParamsDto extends createZodDto(deleteCommentParamsSchema) {}
