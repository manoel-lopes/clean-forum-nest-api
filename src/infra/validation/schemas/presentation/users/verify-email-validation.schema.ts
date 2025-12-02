import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const verifyEmailValidationBodySchema = z.object({
  email: z.email(),
  code: z.string().min(1),
})

export class VerifyEmailValidationBodyDto extends createZodDto(verifyEmailValidationBodySchema) {}
