import { EmailValidation } from '@/domain/enterprise/entities/email-validation.entity'

export class TypeOrmEmailValidationMapper {
  static toDomain (raw: EmailValidation): EmailValidation {
    return raw
  }
}
