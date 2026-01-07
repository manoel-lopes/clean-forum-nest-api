import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { parseIncludesOptions } from '@/infra/http/helpers/parse-includes-options'
import { paginationQuerySchema } from '@/shared/validation/core/pagination.schema'

const includes = ['attachments', 'author']

export const fetchQuestionsQuerySchema = paginationQuerySchema.extend({
  include: z.string().optional().transform(value => parseIncludesOptions(value, includes)),
})

export class FetchQuestionsQueryDto extends createZodDto(fetchQuestionsQuerySchema) {}
