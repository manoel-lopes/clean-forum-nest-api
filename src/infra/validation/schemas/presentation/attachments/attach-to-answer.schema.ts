import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const attachToAnswerParamsSchema = z.object({
  answerId: z.string().uuid(),
})

export const attachToAnswerBodySchema = z.object({
  title: z.string().min(1),
  url: z.string().url(),
})

export type AttachToAnswerParams = z.infer<typeof attachToAnswerParamsSchema>

export type AttachToAnswerBody = z.infer<typeof attachToAnswerBodySchema>

export class AttachToAnswerParamsDto extends createZodDto(attachToAnswerParamsSchema) {}

export class AttachToAnswerBodyDto extends createZodDto(attachToAnswerBodySchema) {}
