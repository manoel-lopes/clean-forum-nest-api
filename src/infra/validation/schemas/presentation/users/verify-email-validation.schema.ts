import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const verifyEmailValidationBodySchema = z.object({
  email: z.email(),
  code: z.string().regex(/^\d{6}$/),
})

export class VerifyEmailValidationBodyDto extends createZodDto(verifyEmailValidationBodySchema) {}
