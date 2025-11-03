import type { EmailValidation as DomainEmailValidation } from '@/domain/enterprise/entities/email-validation.entity'
import type { EmailValidation as PrismaEmailValidation } from '@prisma/client'

export class PrismaEmailValidationMapper {
  static toDomain (raw: PrismaEmailValidation): DomainEmailValidation {
    return {
      ...raw,
      updatedAt: raw.updatedAt || raw.createdAt,
    }
  }
}
