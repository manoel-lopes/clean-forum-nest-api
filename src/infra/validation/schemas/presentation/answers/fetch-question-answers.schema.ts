import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { parseIncludeOptions } from '@/infra/validation/helpers/parse-include-options'
import { paginationQuerySchema } from '@/infra/validation/schemas/core/pagination.schema'
import type { ForumIncludeOption } from '@/shared/types/forum/include-option'

export const fetchQuestionAnswersParamsSchema = z.object({
  questionId: z.uuid(),
})

const includeOptions: ForumIncludeOption[] = ['author', 'comments', 'attachments']

export const fetchQuestionAnswersQuerySchema = paginationQuerySchema.extend({
  include: paginationQuerySchema.shape.include.transform(value => {
    return parseIncludeOptions(value, includeOptions)
  }),
})

export type FetchQuestionAnswersParams = z.infer<typeof fetchQuestionAnswersParamsSchema>

export type FetchQuestionAnswersQuery = z.infer<typeof fetchQuestionAnswersQuerySchema>

export class FetchQuestionAnswersParamsDto extends createZodDto(fetchQuestionAnswersParamsSchema) {}

export class FetchQuestionAnswersQueryDto extends createZodDto(fetchQuestionAnswersQuerySchema) {}
