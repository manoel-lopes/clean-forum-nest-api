import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const fetchUserQuestionsParamsSchema = z.object({
  userId: z.string().uuid(),
})

export const fetchUserQuestionsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
  order: z.enum(['asc', 'desc']).default('desc'),
})

export type FetchUserQuestionsParams = z.infer<typeof fetchUserQuestionsParamsSchema>

export type FetchUserQuestionsQuery = z.infer<typeof fetchUserQuestionsQuerySchema>

export class FetchUserQuestionsParamsDto extends createZodDto(fetchUserQuestionsParamsSchema) {}

export class FetchUserQuestionsQueryDto extends createZodDto(fetchUserQuestionsQuerySchema) {}
