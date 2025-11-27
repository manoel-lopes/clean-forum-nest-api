import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const commentOnQuestionBodySchema = z.object({
  questionId: z.string().uuid(),
  content: z.string().min(1),
})

export type CommentOnQuestionBody = z.infer<typeof commentOnQuestionBodySchema>

export class CommentOnQuestionBodyDto extends createZodDto(commentOnQuestionBodySchema) {}
