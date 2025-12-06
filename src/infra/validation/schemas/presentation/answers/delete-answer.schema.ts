import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const deleteAnswerParamsSchema = z.object({
  answerId: z.uuid(),
})

export class DeleteAnswerParamsDto extends createZodDto(deleteAnswerParamsSchema) {}
