import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const commentOnAnswerBodySchema = z.object({
  answerId: z.string().uuid(),
  content: z.string().min(1),
})

export type CommentOnAnswerBody = z.infer<typeof commentOnAnswerBodySchema>

export class CommentOnAnswerBodyDto extends createZodDto(commentOnAnswerBodySchema) {}
