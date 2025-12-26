import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const sendEmailValidationBodySchema = z.object({
  email: z.email(),
})

export class SendEmailValidationBodyDto extends createZodDto(sendEmailValidationBodySchema) {}
