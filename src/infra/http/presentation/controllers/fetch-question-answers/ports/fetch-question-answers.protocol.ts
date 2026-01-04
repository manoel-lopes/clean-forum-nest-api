import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { parseIncludeOptions } from '@/infra/http/presentation/helpers/parse-include-options'
import { paginationQuerySchema } from '@/infra/http/schemas/core/pagination.schema'

export const fetchQuestionAnswersParamsSchema = z.object({
  questionId: z.uuid(),
})

const includes = ['comments', 'attachments', 'author'] as const
export const fetchQuestionAnswersQuerySchema = paginationQuerySchema.extend({
  include: z.string().optional().transform(value => parseIncludeOptions(value, [...includes])),
})

export type FetchQuestionAnswersParams = z.infer<typeof fetchQuestionAnswersParamsSchema>

export type FetchQuestionAnswersQuery = z.infer<typeof fetchQuestionAnswersQuerySchema>

export class FetchQuestionAnswersParamsDto extends createZodDto(fetchQuestionAnswersParamsSchema) {}

export class FetchQuestionAnswersQueryDto extends createZodDto(fetchQuestionAnswersQuerySchema) {}
