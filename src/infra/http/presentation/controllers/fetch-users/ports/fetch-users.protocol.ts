import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const fetchUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  order: z.enum(['asc', 'desc']).default('desc'),
})

export class FetchUsersQueryDto extends createZodDto(fetchUsersQuerySchema) {}
