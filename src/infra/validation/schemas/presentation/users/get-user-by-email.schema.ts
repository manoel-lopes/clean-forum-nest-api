import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const getUserByEmailParamsSchema = z.object({
  email: z.email(),
})

export type GetUserByEmailParams = z.infer<typeof getUserByEmailParamsSchema>

export class GetUserByEmailParamsDto extends createZodDto(getUserByEmailParamsSchema) {}
