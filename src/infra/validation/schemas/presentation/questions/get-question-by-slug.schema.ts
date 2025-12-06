import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { parseIncludeOptions } from '@/infra/validation/helpers/parse-include-options'
import { paginationQuerySchema } from '@/infra/validation/schemas/core/pagination.schema'
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

export type GetQuestionBySlugParams = z.infer<typeof getQuestionBySlugParamsSchema>

export type GetQuestionBySlugQuery = z.infer<typeof getQuestionBySlugQuerySchema>

export class GetQuestionBySlugParamsDto extends createZodDto(getQuestionBySlugParamsSchema) {}

export class GetQuestionBySlugQueryDto extends createZodDto(getQuestionBySlugQuerySchema) {}
