import type { EmailValidation as PrismaEmailValidation } from '@prisma/client'
import type { EmailValidation as DomainEmailValidation } from '@/domain/enterprise/entities/email-validation.entity'
import { BasePrismaMapper } from './base/base-prisma.mapper'

export class PrismaEmailValidationMapper {
  static toDomain (raw: PrismaEmailValidation): DomainEmailValidation {
    return {
      ...raw,
      updatedAt: BasePrismaMapper.normalizeTimestamp(raw.updatedAt, raw.createdAt),
    }
  }
}
