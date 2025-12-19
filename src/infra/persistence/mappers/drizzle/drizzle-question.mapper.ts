import type { QuestionWithRelations } from '@/domain/application/repositories/questions.repository'
import type { attachments, comments, questions, users } from '@/infra/persistence/drizzle/schema'
import type { Question } from '@/domain/enterprise/entities/question.entity'
import { DrizzleAttachmentMapper } from './drizzle-attachment.mapper'
import { DrizzleCommentMapper } from './drizzle-comment.mapper'
import { DrizzleUserMapper } from './drizzle-user.mapper'

type DrizzleQuestion = typeof questions.$inferSelect
type DrizzleQuestionWithRelations = DrizzleQuestion & {
  author?: typeof users.$inferSelect
  comments?: (typeof comments.$inferSelect)[]
  attachments?: (typeof attachments.$inferSelect)[]
}

export class DrizzleQuestionMapper {
  static toDomain (raw: DrizzleQuestion): Question {
    return {
      id: raw.id,
      title: raw.title,
      slug: raw.slug,
      content: raw.content,
      authorId: raw.authorId,
      bestAnswerId: raw.bestAnswerId,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    }
  }

  static toQuestion (raw: DrizzleQuestionWithRelations): QuestionWithRelations {
    const result: QuestionWithRelations = {
      id: raw.id,
      title: raw.title,
      slug: raw.slug,
      content: raw.content,
      authorId: raw.authorId,
      bestAnswerId: raw.bestAnswerId,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    }
    if (raw.author) {
      result.author = DrizzleUserMapper.toAuthor(raw.author)
    }
    if (raw.comments) {
      result.comments = raw.comments.map(DrizzleCommentMapper.toQuestionComment)
    }
    if (raw.attachments) {
      result.attachments = raw.attachments.map(DrizzleAttachmentMapper.toQuestionAttachment)
    }
    return result
  }
}
