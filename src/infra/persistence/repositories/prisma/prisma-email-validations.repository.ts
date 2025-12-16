import { Injectable } from '@nestjs/common'
import type {
  EmailValidationsRepository,
  UpdateEmailValidationData,
} from '@/domain/application/repositories/email-validations.repository'
import { PrismaEmailValidationMapper } from '@/infra/persistence/mappers/prisma/prisma-email-validation.mapper'
import { PrismaService } from '@/infra/persistence/prisma.service'
import type { EmailValidation, EmailValidationProps } from '@/domain/enterprise/entities/email-validation.entity'

@Injectable()
export class PrismaEmailValidationsRepository implements EmailValidationsRepository {
  constructor (private readonly prisma: PrismaService) {}

  async create (data: EmailValidationProps): Promise<EmailValidation> {
    const emailValidation = await this.prisma.emailValidation.create({ data })
    return PrismaEmailValidationMapper.toDomain(emailValidation)
  }

  async update ({ where, data }: UpdateEmailValidationData): Promise<EmailValidation> {
    const updatedEmailValidation = await this.prisma.emailValidation.update({ where, data })
    return PrismaEmailValidationMapper.toDomain(updatedEmailValidation)
  }

  async findByEmail (email: string): Promise<EmailValidation | null> {
    const emailValidation = await this.prisma.emailValidation.findUnique({
      where: { email },
    })
    if (!emailValidation) return null
    return PrismaEmailValidationMapper.toDomain(emailValidation)
  }

  async findById (emailValidationId: string): Promise<EmailValidation | null> {
    const emailValidation = await this.prisma.emailValidation.findUnique({
      where: { id: emailValidationId },
    })
    if (!emailValidation) return null
    return PrismaEmailValidationMapper.toDomain(emailValidation)
  }

  async delete (emailValidationId: string): Promise<void> {
    await this.prisma.emailValidation.delete({
      where: { id: emailValidationId },
    })
  }
}
