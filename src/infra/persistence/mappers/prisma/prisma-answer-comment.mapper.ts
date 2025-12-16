import type { Comment } from '@prisma/client'
import type { AnswerComment } from '@/domain/enterprise/entities/answer-comment.entity'
import { BasePrismaMapper } from './base/base-prisma.mapper'

export class PrismaAnswerCommentMapper {
  static toDomain (raw: Comment): AnswerComment {
    return BasePrismaMapper.mapAnswerComment(raw)
  }
}
