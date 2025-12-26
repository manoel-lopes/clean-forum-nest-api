import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const commentOnAnswerBodySchema = z.object({
  answerId: z.uuid(),
  content: z.string().min(1),
})
export class CommentOnAnswerBodyDto extends createZodDto(commentOnAnswerBodySchema) {}
