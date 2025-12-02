import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const refreshTokenBodySchema = z.object({
  refreshTokenId: z.string().uuid(),
})

export class RefreshTokenBodyDto extends createZodDto(refreshTokenBodySchema) {}
