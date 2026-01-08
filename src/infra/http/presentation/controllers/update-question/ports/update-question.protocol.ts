import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const updateQuestionParamsSchema = z.object({
  questionId: z.uuid(),
})

export const updateQuestionBodySchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
})

export class UpdateQuestionParamsDto extends createZodDto(updateQuestionParamsSchema) {}

export class UpdateQuestionBodyDto extends createZodDto(updateQuestionBodySchema) {}
