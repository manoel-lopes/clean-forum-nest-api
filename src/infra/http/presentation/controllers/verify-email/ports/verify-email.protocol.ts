import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const verifyEmailBodySchema = z.object({
  email: z.email(),
  code: z.string().regex(/^\d{6}$/),
})

export class VerifyEmailBodyDto extends createZodDto(verifyEmailBodySchema) {}
