import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { parseIncludeOptions } from '@/infra/http/presentation/helpers/parse-include-options'
import { paginationQuerySchema } from '@/infra/http/schemas/core/pagination.schema'
import type { ForumIncludeOption } from '@/shared/types/forum/include-option'

export const getQuestionBySlugParamsSchema = z.object({
  slug: z.string().min(1),
})

const includeOptions: ForumIncludeOption[] = ['author', 'comments', 'attachments']

export const getQuestionBySlugQuerySchema = paginationQuerySchema.extend({
  include: paginationQuerySchema.shape.include.transform(value => {
    return parseIncludeOptions(value, includeOptions)
  }),
  answerIncludes: paginationQuerySchema.shape.include.transform(value => {
    return parseIncludeOptions(value, includeOptions)
  }),
})

export class GetQuestionBySlugParamsDto extends createZodDto(getQuestionBySlugParamsSchema) {}

export class GetQuestionBySlugQueryDto extends createZodDto(getQuestionBySlugQuerySchema) {}
