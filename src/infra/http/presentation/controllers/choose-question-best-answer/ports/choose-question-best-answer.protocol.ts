import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const chooseQuestionBestAnswerParamsSchema = z.object({
  answerId: z.uuid(),
})

export type ChooseQuestionBestAnswerParams = z.infer<typeof chooseQuestionBestAnswerParamsSchema>

export class ChooseQuestionBestAnswerParamsDto extends createZodDto(chooseQuestionBestAnswerParamsSchema) {}
