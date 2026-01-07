import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const updateAnswerParamsSchema = z.object({
  answerId: z.uuid(),
})

export const updateAnswerBodySchema = z.object({
  content: z.string().min(1),
})

export class UpdateAnswerParamsDto extends createZodDto(updateAnswerParamsSchema) {}

export class UpdateAnswerBodyDto extends createZodDto(updateAnswerBodySchema) {}
