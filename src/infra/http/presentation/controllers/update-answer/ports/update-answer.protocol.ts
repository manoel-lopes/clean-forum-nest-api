import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const updateAnswerParamsSchema = z.object({
  answerId: z.uuid(),
})

export const updateAnswerBodySchema = z.object({
  content: z.string().min(1),
})

export type UpdateAnswerParams = z.infer<typeof updateAnswerParamsSchema>

export type UpdateAnswerBody = z.infer<typeof updateAnswerBodySchema>

export class UpdateAnswerParamsDto extends createZodDto(updateAnswerParamsSchema) {}

export class UpdateAnswerBodyDto extends createZodDto(updateAnswerBodySchema) {}
