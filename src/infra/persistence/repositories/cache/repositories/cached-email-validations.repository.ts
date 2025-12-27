import { Inject, Injectable } from '@nestjs/common'
import type {
  EmailValidationsRepository,
  UpdateEmailValidationData,
} from '@/domain/application/repositories/email-validations.repository'
import { RedisCacheService } from '@/infra/persistence/repositories/cache/redis-cache.service'
import type { EmailValidation, EmailValidationProps } from '@/domain/enterprise/entities/email-validation.entity'
import { BaseCachedRepository } from './base/base-cached.repository'

export const PrismaEmailValidationsRepositoryToken = Symbol('PrismaEmailValidationsRepositoryToken')

@Injectable()
export class CachedEmailValidationsRepository
  extends BaseCachedRepository
  implements EmailValidationsRepository {
  private readonly EMAIL_VALIDATIONS_TTL = 3600
  private readonly validationIdToEmail = new Map<string, string>()

  constructor (
    protected readonly redis: RedisCacheService,
    @Inject(PrismaEmailValidationsRepositoryToken)
    private readonly emailValidationsRepository: EmailValidationsRepository
  ) {
    super(redis)
  }

  async create (emailValidationData: EmailValidationProps): Promise<EmailValidation> {
    const emailValidation = await this.emailValidationsRepository.create(emailValidationData)
    this.validationIdToEmail.set(emailValidation.id, emailValidation.email)
    await this.setCache(
      this.getEmailValidationCacheKey(emailValidation.id),
      emailValidation,
      this.EMAIL_VALIDATIONS_TTL
    )
    await this.setCache(
      this.getEmailValidationByEmailCacheKey(emailValidation.email),
      emailValidation,
      this.EMAIL_VALIDATIONS_TTL
    )
    return emailValidation
  }

  async update ({ where, data }: UpdateEmailValidationData): Promise<EmailValidation> {
    const emailValidation = await this.emailValidationsRepository.update({ where, data })
    this.validationIdToEmail.set(emailValidation.id, emailValidation.email)
    await this.setCache(
      this.getEmailValidationCacheKey(emailValidation.id),
      emailValidation,
      this.EMAIL_VALIDATIONS_TTL
    )
    await this.setCache(
      this.getEmailValidationByEmailCacheKey(emailValidation.email),
      emailValidation,
      this.EMAIL_VALIDATIONS_TTL
    )
    return emailValidation
  }

  async findByEmail (email: string): Promise<EmailValidation | null> {
    const cacheKey = this.getEmailValidationByEmailCacheKey(email)
    const cached = await this.getFromCache<EmailValidation>(cacheKey)
    if (cached) {
      this.validationIdToEmail.set(cached.id, cached.email)
      return cached
    }
    const validation = await this.emailValidationsRepository.findByEmail(email)
    if (validation) {
      this.validationIdToEmail.set(validation.id, validation.email)
      await this.setCache(cacheKey, validation, this.EMAIL_VALIDATIONS_TTL)
    }
    return validation
  }

  async findById (id: string): Promise<EmailValidation | null> {
    const cacheKey = this.getEmailValidationCacheKey(id)
    const cached = await this.getFromCache<EmailValidation>(cacheKey)
    if (cached) {
      this.validationIdToEmail.set(cached.id, cached.email)
      return cached
    }
    const validation = await this.emailValidationsRepository.findById(id)
    if (validation) {
      this.validationIdToEmail.set(validation.id, validation.email)
      await this.setCache(cacheKey, validation, this.EMAIL_VALIDATIONS_TTL)
    }
    return validation
  }

  async delete (id: string): Promise<void> {
    const email = this.validationIdToEmail.get(id)
    await this.emailValidationsRepository.delete(id)
    await this.invalidateCache(this.getEmailValidationCacheKey(id))
    if (email) {
      await this.invalidateCache(this.getEmailValidationByEmailCacheKey(email))
    }
    this.validationIdToEmail.delete(id)
  }

  private getEmailValidationCacheKey (id: string) {
    return `email-validation:${id}`
  }

  private getEmailValidationByEmailCacheKey (email: string) {
    return `email-validation:email:${email}`
  }
}
