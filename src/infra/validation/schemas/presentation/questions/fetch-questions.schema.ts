import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { parseIncludeOptions } from '@/infra/validation/helpers/parse-include-options'
import { paginationQuerySchema } from '@/infra/validation/schemas/core/pagination.schema'
import type { ForumIncludeOption } from '@/shared/types/forum/include-option'

const includeOptions: ForumIncludeOption[] = ['author', 'comments', 'attachments']

export const fetchQuestionsQuerySchema = paginationQuerySchema.extend({
  include: paginationQuerySchema.shape.include.transform(value => {
    return parseIncludeOptions(value, includeOptions)
  }),
})

export type FetchQuestionsQuery = z.infer<typeof fetchQuestionsQuerySchema>

export class FetchQuestionsQueryDto extends createZodDto(fetchQuestionsQuerySchema) {}
