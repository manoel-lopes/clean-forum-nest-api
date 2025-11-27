import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const refreshTokenBodySchema = z.object({
  refreshTokenId: z.string().uuid(),
})

export type RefreshTokenBody = z.infer<typeof refreshTokenBodySchema>

export class RefreshTokenBodyDto extends createZodDto(refreshTokenBodySchema) {}
