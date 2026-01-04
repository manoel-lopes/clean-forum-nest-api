import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { parseIncludeOptions } from '@/infra/http/presentation/helpers/parse-include-options'
import { paginationQuerySchema } from '@/infra/http/schemas/core/pagination.schema'

const questionIncludes = ['attachments', 'author'] as const
const answerIncludes = ['comments', 'attachments', 'author'] as const

export const getQuestionBySlugParamsSchema = z.object({
  slug: z.string().min(1),
})

export const getQuestionBySlugQuerySchema = paginationQuerySchema.extend({
  include: z.string().optional().transform(v => parseIncludeOptions(v, [...questionIncludes])),
  answerIncludes: z.string().optional().transform(v => parseIncludeOptions(v, [...answerIncludes])),
})

export type GetQuestionBySlugParams = z.infer<typeof getQuestionBySlugParamsSchema>

export type GetQuestionBySlugQuery = z.infer<typeof getQuestionBySlugQuerySchema>

export class GetQuestionBySlugParamsDto extends createZodDto(getQuestionBySlugParamsSchema) {}

export class GetQuestionBySlugQueryDto extends createZodDto(getQuestionBySlugQuerySchema) {}
