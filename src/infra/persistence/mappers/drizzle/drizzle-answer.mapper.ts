import type { AnswerWithRelations } from '@/domain/application/repositories/answers.repository'
import type { answers, attachments, comments, users } from '@/infra/persistence/drizzle/schema'
import type { Answer } from '@/domain/enterprise/entities/answer.entity'
import { DrizzleAttachmentMapper } from './drizzle-attachment.mapper'
import { DrizzleCommentMapper } from './drizzle-comment.mapper'
import { DrizzleUserMapper } from './drizzle-user.mapper'

type DrizzleAnswer = typeof answers.$inferSelect
type DrizzleAnswerWithRelations = DrizzleAnswer & {
  author?: typeof users.$inferSelect
  comments?: (typeof comments.$inferSelect)[]
  attachments?: (typeof attachments.$inferSelect)[]
}

export class DrizzleAnswerMapper {
  static toDomain (raw: DrizzleAnswer): Answer {
    return {
      id: raw.id,
      content: raw.content,
      authorId: raw.authorId,
      questionId: raw.questionId,
      excerpt: raw.excerpt,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    }
  }

  static toAnswer (raw: DrizzleAnswerWithRelations): AnswerWithRelations {
    const result: AnswerWithRelations = {
      id: raw.id,
      content: raw.content,
      authorId: raw.authorId,
      questionId: raw.questionId,
      excerpt: raw.excerpt,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    }
    if (raw.author) {
      result.author = DrizzleUserMapper.toAuthor(raw.author)
    }
    if (raw.comments) {
      result.comments = raw.comments.map(DrizzleCommentMapper.toAnswerComment)
    }
    if (raw.attachments) {
      result.attachments = raw.attachments.map(DrizzleAttachmentMapper.toAnswerAttachment)
    }
    return result
  }
}
