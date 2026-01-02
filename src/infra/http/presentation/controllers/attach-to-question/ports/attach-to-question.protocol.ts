import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const attachToQuestionParamsSchema = z.object({
  questionId: z.uuid(),
})

export const attachToQuestionBodySchema = z.object({
  title: z.string().min(1),
  url: z.url(),
})

export class AttachToQuestionParamsDto extends createZodDto(attachToQuestionParamsSchema) {}

export class AttachToQuestionBodyDto extends createZodDto(attachToQuestionBodySchema) {}
