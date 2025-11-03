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
    const emailValidation = await this.prisma.emailValidation.create({ data })
    return emailValidation
  }

  async update ({ where, data }: UpdateEmailValidationData): Promise<EmailValidation> {
    const updatedEmailValidation = await this.prisma.emailValidation.update({ where, data })
    return updatedEmailValidation
  }

  async findByEmail (email: string): Promise<EmailValidation | null> {
    const emailValidation = await this.prisma.emailValidation.findUnique({
      where: { email },
    })
    return emailValidation
  }

  async findById (emailValidationId: string): Promise<EmailValidation | null> {
    const emailValidation = await this.prisma.emailValidation.findUnique({
      where: { id: emailValidationId },
    })
    return emailValidation
  }

  async delete (emailValidationId: string): Promise<void> {
    await this.prisma.emailValidation.delete({
      where: { id: emailValidationId },
    })
  }
}
