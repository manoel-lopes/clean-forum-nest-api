import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { parseIncludesOptions } from '@/infra/validation/helpers/parse-includes-options'
import { paginationQuerySchema } from '@/infra/validation/schemas/core/pagination.schema'

const questionIncludes = ['attachments', 'author']
const answerIncludes = ['comments', 'attachments', 'author']

export const getQuestionBySlugParamsSchema = z.object({
  slug: z.string().min(1),
})

export const getQuestionBySlugQuerySchema = paginationQuerySchema.extend({
  include: z.string().optional().transform(v => parseIncludesOptions(v, questionIncludes)),
  answerIncludes: z.string().optional().transform(v => parseIncludesOptions(v, answerIncludes)),
})

export type GetQuestionBySlugParams = z.infer<typeof getQuestionBySlugParamsSchema>

export type GetQuestionBySlugQuery = z.infer<typeof getQuestionBySlugQuerySchema>

export class GetQuestionBySlugParamsDto extends createZodDto(getQuestionBySlugParamsSchema) {}

export class GetQuestionBySlugQueryDto extends createZodDto(getQuestionBySlugQuerySchema) {}
