import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const deleteAnswerParamsSchema = z.object({
  answerId: z.uuid(),
})

export type DeleteAnswerParams = z.infer<typeof deleteAnswerParamsSchema>

export class DeleteAnswerParamsDto extends createZodDto(deleteAnswerParamsSchema) {}
