import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const createQuestionBodySchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  attachments: z.array(z.object({
    title: z.string().min(1),
    url: z.url(),
  })).optional(),
})

export type CreateQuestionBody = z.infer<typeof createQuestionBodySchema>

export class CreateQuestionBodyDto extends createZodDto(createQuestionBodySchema) {}
