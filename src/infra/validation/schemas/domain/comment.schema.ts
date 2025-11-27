import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const commentSchema = z.object({
  id: z.string().uuid(),
  content: z.string(),
  authorId: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export class CommentDto extends createZodDto(commentSchema) {}
