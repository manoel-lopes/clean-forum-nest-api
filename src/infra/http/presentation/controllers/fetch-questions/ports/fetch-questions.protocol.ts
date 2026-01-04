import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { parseIncludeOptions } from '@/infra/http/presentation/helpers/parse-include-options'
import { paginationQuerySchema } from '@/infra/http/schemas/core/pagination.schema'

const includes = ['attachments', 'author'] as const

export const fetchQuestionsQuerySchema = paginationQuerySchema.extend({
  include: z.string().optional().transform(value => parseIncludeOptions(value, [...includes])),
})

export type FetchQuestionsQuery = z.infer<typeof fetchQuestionsQuerySchema>

export class FetchQuestionsQueryDto extends createZodDto(fetchQuestionsQuerySchema) {}
