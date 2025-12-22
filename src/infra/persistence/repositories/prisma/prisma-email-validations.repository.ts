import { Injectable } from '@nestjs/common'
import type {
  EmailValidationsRepository,
  UpdateEmailValidationData,
} from '@/domain/application/repositories/email-validations.repository'
import { PrismaService } from '@/infra/persistence/prisma.service'
import type { EmailValidation, EmailValidationProps } from '@/domain/enterprise/entities/email-validation.entity'

@Injectable()
export class PrismaEmailValidationsRepository implements EmailValidationsRepository {
  constructor (private readonly prisma: PrismaService) {}

  async create (data: EmailValidationProps): Promise<EmailValidation> {
    return this.prisma.emailValidation.create({ data })
  }

  async update ({ where, data }: UpdateEmailValidationData): Promise<EmailValidation> {
    return this.prisma.emailValidation.update({ where, data })
  }

  async findByEmail (email: string): Promise<EmailValidation | null> {
    return this.prisma.emailValidation.findUnique({
      where: { email },
    })
  }

  async findById (emailValidationId: string): Promise<EmailValidation | null> {
    return this.prisma.emailValidation.findUnique({
      where: { id: emailValidationId },
    })
  }

  async delete (emailValidationId: string): Promise<void> {
    await this.prisma.emailValidation.delete({
      where: { id: emailValidationId },
    })
  }
}
