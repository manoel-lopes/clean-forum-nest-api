import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const commentOnQuestionBodySchema = z.object({
  questionId: z.uuid(),
  content: z.string().min(1),
})
export class CommentOnQuestionBodyDto extends createZodDto(commentOnQuestionBodySchema) {}
