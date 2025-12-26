import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const answerSchema = z.object({
  id: z.uuid(),
  content: z.string(),
  questionId: z.uuid(),
  authorId: z.uuid(),
  excerpt: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export class AnswerDto extends createZodDto(answerSchema) {}
