import { createZodDto } from 'nestjs-zod'
import { parseIncludeOptions } from '@/infra/http/presentation/helpers/parse-include-options'
import { paginationQuerySchema } from '@/infra/http/schemas/core/pagination.schema'
import type { ForumIncludeOption } from '@/shared/types/forum/include-option'

const includeOptions: ForumIncludeOption[] = ['author', 'comments', 'attachments']

export const fetchQuestionsQuerySchema = paginationQuerySchema.extend({
  include: paginationQuerySchema.shape.include.transform(value => {
    return parseIncludeOptions(value, includeOptions)
  }),
})
export class FetchQuestionsQueryDto extends createZodDto(fetchQuestionsQuerySchema) {}
