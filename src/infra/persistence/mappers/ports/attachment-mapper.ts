import type { Attachment as PrismaAttachment } from '@prisma/client'
import type { Attachment } from '@/domain/enterprise/entities/base/attachment.entity'

export type AttachmentMapperClass<T extends Attachment> = {
  toDomain(raw: PrismaAttachment): T
}
