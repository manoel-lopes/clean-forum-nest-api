import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { parseIncludeOptions } from '@/infra/validation/helpers/parse-include-options'
import { paginationQuerySchema } from '@/infra/validation/schemas/core/pagination.schema'

export const fetchQuestionsQuerySchema = paginationQuerySchema.extend({
  include: z.string().optional().transform(parseIncludeOptions),
})

export type FetchQuestionsQuery = z.infer<typeof fetchQuestionsQuerySchema>

export class FetchQuestionsQueryDto extends createZodDto(fetchQuestionsQuerySchema) {}
