import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const questionSchema = z.object({
  id: z.string().uuid(),
  authorId: z.string().uuid(),
  title: z.string(),
  content: z.string(),
  slug: z.string(),
  bestAnswerId: z.string().uuid().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export class QuestionDto extends createZodDto(questionSchema) {}
