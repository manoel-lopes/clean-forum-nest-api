import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const questionSchema = z.object({
  id: z.uuid(),
  authorId: z.uuid(),
  title: z.string(),
  content: z.string(),
  slug: z.string(),
  bestAnswerId: z.uuid().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export class QuestionDto extends createZodDto(questionSchema) {}
