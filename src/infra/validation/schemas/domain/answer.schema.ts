import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const answerSchema = z.object({
  id: z.string().uuid(),
  content: z.string(),
  questionId: z.string().uuid(),
  authorId: z.string().uuid(),
  excerpt: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export class AnswerDto extends createZodDto(answerSchema) {}
