import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const deleteQuestionParamsSchema = z.object({
  questionId: z.uuid(),
})

export type DeleteQuestionParams = z.infer<typeof deleteQuestionParamsSchema>

export class DeleteQuestionParamsDto extends createZodDto(deleteQuestionParamsSchema) {}
