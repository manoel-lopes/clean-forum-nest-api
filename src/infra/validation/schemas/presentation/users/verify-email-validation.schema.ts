import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const verifyEmailValidationBodySchema = z.object({
  email: z.email(),
  code: z.string().min(1),
})

export type VerifyEmailValidationBody = z.infer<typeof verifyEmailValidationBodySchema>

export class VerifyEmailValidationBodyDto extends createZodDto(verifyEmailValidationBodySchema) {}
