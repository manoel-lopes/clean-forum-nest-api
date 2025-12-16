import type { Comment } from '@prisma/client'
import type { QuestionComment } from '@/domain/enterprise/entities/question-comment.entity'
import { BasePrismaMapper } from './base/base-prisma.mapper'

export class PrismaQuestionCommentMapper {
  static toDomain (raw: Comment): QuestionComment {
    return BasePrismaMapper.mapQuestionComment(raw)
  }
}
