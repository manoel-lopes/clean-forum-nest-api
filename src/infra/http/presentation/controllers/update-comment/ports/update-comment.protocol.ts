import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const updateCommentParamsSchema = z.object({
  commentId: z.uuid(),
})

export const updateCommentBodySchema = z.object({
  content: z.string().min(1),
})

export type UpdateCommentParams = z.infer<typeof updateCommentParamsSchema>

export type UpdateCommentBody = z.infer<typeof updateCommentBodySchema>

export class UpdateCommentParamsDto extends createZodDto(updateCommentParamsSchema) {}

export class UpdateCommentBodyDto extends createZodDto(updateCommentBodySchema) {}
