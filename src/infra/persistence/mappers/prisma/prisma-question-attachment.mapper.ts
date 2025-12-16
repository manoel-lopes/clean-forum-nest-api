import type { Attachment } from '@prisma/client'
import type { QuestionAttachment } from '@/domain/enterprise/entities/question-attachment.entity'
import { BasePrismaMapper } from './base/base-prisma.mapper'

export class PrismaQuestionAttachmentMapper {
  static toDomain (raw: Attachment): QuestionAttachment {
    return BasePrismaMapper.mapQuestionAttachment(raw)
  }
}
