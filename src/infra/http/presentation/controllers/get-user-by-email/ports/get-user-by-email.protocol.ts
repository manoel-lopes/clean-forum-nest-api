import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const getUserByEmailParamsSchema = z.object({
  email: z.email(),
})

export class GetUserByEmailParamsDto extends createZodDto(getUserByEmailParamsSchema) {}
