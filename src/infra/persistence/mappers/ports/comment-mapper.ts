import type { Comment as PrismaComment } from '@prisma/client'
import type { Comment } from '@/domain/enterprise/entities/base/comment.entity'

export type CommentMapperClass<T extends Comment> = {
  toDomain(raw: PrismaComment): T
}
