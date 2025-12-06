import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const chooseQuestionBestAnswerParamsSchema = z.object({
  answerId: z.uuid(),
})

export class ChooseQuestionBestAnswerParamsDto extends createZodDto(chooseQuestionBestAnswerParamsSchema) {}
