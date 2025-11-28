import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const sendEmailValidationBodySchema = z.object({
  email: z.email(),
})

export type SendEmailValidationBody = z.infer<typeof sendEmailValidationBodySchema>

export class SendEmailValidationBodyDto extends createZodDto(sendEmailValidationBodySchema) {}
