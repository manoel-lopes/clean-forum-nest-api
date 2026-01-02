import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { parseIncludesOptions } from '@/infra/http/helpers/parse-includes-options'
import { paginationQuerySchema } from '@/shared/validation/core/pagination.schema'

export const fetchQuestionAnswersParamsSchema = z.object({
  questionId: z.uuid(),
})

const includes = ['comments', 'attachments', 'author']
export const fetchQuestionAnswersQuerySchema = paginationQuerySchema.extend({
  include: z.string().optional().transform(value => parseIncludesOptions(value, includes)),
})

export type FetchQuestionAnswersParams = z.infer<typeof fetchQuestionAnswersParamsSchema>

export type FetchQuestionAnswersQuery = z.infer<typeof fetchQuestionAnswersQuerySchema>

export class FetchQuestionAnswersParamsDto extends createZodDto(fetchQuestionAnswersParamsSchema) {}

export class FetchQuestionAnswersQueryDto extends createZodDto(fetchQuestionAnswersQuerySchema) {}
