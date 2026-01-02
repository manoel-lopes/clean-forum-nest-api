import { z } from 'zod'

export const commentSchema = z.object({
  id: z.uuid(),
  content: z.string(),
  authorId: z.uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
