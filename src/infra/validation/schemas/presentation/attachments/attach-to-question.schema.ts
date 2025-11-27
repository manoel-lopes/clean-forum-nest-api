import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const attachToQuestionParamsSchema = z.object({
  questionId: z.string().uuid(),
})

export const attachToQuestionBodySchema = z.object({
  title: z.string().min(1),
  url: z.string().url(),
})

export type AttachToQuestionParams = z.infer<typeof attachToQuestionParamsSchema>

export type AttachToQuestionBody = z.infer<typeof attachToQuestionBodySchema>

export class AttachToQuestionParamsDto extends createZodDto(attachToQuestionParamsSchema) {}

export class AttachToQuestionBodyDto extends createZodDto(attachToQuestionBodySchema) {}
