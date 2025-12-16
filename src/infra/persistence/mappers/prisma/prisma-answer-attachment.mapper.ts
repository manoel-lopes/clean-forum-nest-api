import type { Attachment } from '@prisma/client'
import type { AnswerAttachment } from '@/domain/enterprise/entities/answer-attachment.entity'
import { BasePrismaMapper } from './base/base-prisma.mapper'

export class PrismaAnswerAttachmentMapper {
  static toDomain (raw: Attachment): AnswerAttachment {
    return BasePrismaMapper.mapAnswerAttachment(raw)
  }
}
