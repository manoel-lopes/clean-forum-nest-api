import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  order: z.enum(['asc', 'desc']).default('desc'),
  include: z.string().optional()
})

export class PaginationQueryDto extends createZodDto(paginationQuerySchema) {}

export const paginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    page: z.number(),
    pageSize: z.number(),
    totalItems: z.number(),
    totalPages: z.number(),
    order: z.enum(['asc', 'desc']),
    items: z.array(itemSchema),
  })
