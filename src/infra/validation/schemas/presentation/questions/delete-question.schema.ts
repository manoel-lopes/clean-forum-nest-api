import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const deleteQuestionParamsSchema = z.object({
  questionId: z.uuid(),
})

export class DeleteQuestionParamsDto extends createZodDto(deleteQuestionParamsSchema) {}
