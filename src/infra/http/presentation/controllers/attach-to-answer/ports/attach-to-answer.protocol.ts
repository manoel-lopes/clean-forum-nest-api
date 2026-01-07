import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const attachToAnswerParamsSchema = z.object({
  answerId: z.uuid(),
})

export const attachToAnswerBodySchema = z.object({
  title: z.string().min(1),
  url: z.url(),
})

export class AttachToAnswerParamsDto extends createZodDto(attachToAnswerParamsSchema) {}

export class AttachToAnswerBodyDto extends createZodDto(attachToAnswerBodySchema) {}
