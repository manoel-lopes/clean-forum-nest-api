import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const userSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  email: z.email(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export class UserDto extends createZodDto(userSchema) {}
