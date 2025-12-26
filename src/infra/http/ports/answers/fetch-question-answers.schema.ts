import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { parseIncludeOptions } from '@/infra/http/presentation/helpers/parse-include-options'
import { paginationQuerySchema } from '@/infra/http/schemas/core/pagination.schema'
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

export class FetchQuestionAnswersParamsDto extends createZodDto(fetchQuestionAnswersParamsSchema) {}

export class FetchQuestionAnswersQueryDto extends createZodDto(fetchQuestionAnswersQuerySchema) {}
