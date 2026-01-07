import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const fetchNotificationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  order: z.enum(['asc', 'desc']).default('desc'),
})

export class FetchNotificationsQueryDto extends createZodDto(fetchNotificationsQuerySchema) {}
