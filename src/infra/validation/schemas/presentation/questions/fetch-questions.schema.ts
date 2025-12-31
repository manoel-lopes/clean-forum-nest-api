import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { parseIncludesOptions } from '@/infra/validation/helpers/parse-includes-options'
import { paginationQuerySchema } from '@/infra/validation/schemas/core/pagination.schema'

const includes = ['attachments', 'author']

export const fetchQuestionsQuerySchema = paginationQuerySchema.extend({
  include: z.string().optional().transform(value => parseIncludesOptions(value, includes)),
})

export type FetchQuestionsQuery = z.infer<typeof fetchQuestionsQuerySchema>

export class FetchQuestionsQueryDto extends createZodDto(fetchQuestionsQuerySchema) {}
