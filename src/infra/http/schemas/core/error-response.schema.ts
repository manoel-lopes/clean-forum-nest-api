import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const errorResponseSchema = z.object({
  statusCode: z.number(),
  message: z.string(),
  error: z.string().optional(),
})

export class ErrorResponseDto extends createZodDto(errorResponseSchema) {}
