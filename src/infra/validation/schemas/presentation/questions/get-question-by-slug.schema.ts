import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { parseIncludeOptions } from '@/infra/validation/helpers/parse-include-options'
import { paginationQuerySchema } from '@/infra/validation/schemas/core/pagination.schema'

export const getQuestionBySlugParamsSchema = z.object({
  slug: z.string().min(1),
})

export const getQuestionBySlugQuerySchema = paginationQuerySchema.extend({
  include: z.string().optional().transform(parseIncludeOptions),
  answerIncludes: z.string().optional().transform(parseIncludeOptions),
})

export type GetQuestionBySlugParams = z.infer<typeof getQuestionBySlugParamsSchema>

export type GetQuestionBySlugQuery = z.infer<typeof getQuestionBySlugQuerySchema>

export class GetQuestionBySlugParamsDto extends createZodDto(getQuestionBySlugParamsSchema) {}

export class GetQuestionBySlugQueryDto extends createZodDto(getQuestionBySlugQuerySchema) {}
