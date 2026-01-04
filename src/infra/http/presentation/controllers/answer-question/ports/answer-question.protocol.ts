import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const answerQuestionParamsSchema = z.object({
  questionId: z.uuid(),
})

export const answerQuestionBodySchema = z.object({
  content: z.string().min(1),
})

export type AnswerQuestionParams = z.infer<typeof answerQuestionParamsSchema>

export type AnswerQuestionBody = z.infer<typeof answerQuestionBodySchema>

export class AnswerQuestionParamsDto extends createZodDto(answerQuestionParamsSchema) {}

export class AnswerQuestionBodyDto extends createZodDto(answerQuestionBodySchema) {}
