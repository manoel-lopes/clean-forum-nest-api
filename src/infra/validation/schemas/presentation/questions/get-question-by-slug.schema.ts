import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const getQuestionBySlugParamsSchema = z.object({
  slug: z.string().min(1),
})

export const getQuestionBySlugQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
  order: z.enum(['asc', 'desc']).default('desc'),
  include: z.string().optional(),
  answerIncludes: z.string().optional(),
})

export class GetQuestionBySlugParamsDto extends createZodDto(getQuestionBySlugParamsSchema) {}

export class GetQuestionBySlugQueryDto extends createZodDto(getQuestionBySlugQuerySchema) {}
