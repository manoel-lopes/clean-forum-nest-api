import { Inject, Injectable } from '@nestjs/common'
import type {
  EmailValidationsRepository,
  UpdateEmailValidationData,
} from '@/domain/application/repositories/email-validations.repository'
import { RedisCacheService } from '@/infra/cache/redis-cache.service'
import type { EmailValidation } from '@/domain/enterprise/entities/email-validation/email-validation.entity'
import { BaseCachedRepository } from './base/base-cached.repository'

export const TypeOrmEmailValidationsRepositoryToken = Symbol('TypeOrmEmailValidationsRepositoryToken')

@Injectable()
export class CachedEmailValidationsRepository
  extends BaseCachedRepository
  implements EmailValidationsRepository {
  private readonly EMAIL_VALIDATION_TTL = 5 * 60
  private readonly validationIdToEmail = new Map<string, string>()

  constructor (
    protected readonly cacheService: RedisCacheService,
    @Inject(TypeOrmEmailValidationsRepositoryToken)
    private readonly emailValidationsRepository: EmailValidationsRepository
  ) {
    super(cacheService)
  }

  async save (emailValidation: EmailValidation): Promise<void> {
    await this.emailValidationsRepository.save(emailValidation)
    this.validationIdToEmail.set(emailValidation.id, emailValidation.email)
    await Promise.all([
      this.setCache(
        this.getEmailValidationCacheKey(emailValidation.id), emailValidation, this.EMAIL_VALIDATION_TTL
      ),
      this.setCache(
        this.getEmailValidationByEmailCacheKey(emailValidation.email), emailValidation, this.EMAIL_VALIDATION_TTL
      ),
    ])
  }

  async update (emailValidationData: UpdateEmailValidationData): Promise<EmailValidation> {
    const emailValidation = await this.emailValidationsRepository.update(emailValidationData)
    this.validationIdToEmail.set(emailValidation.id, emailValidation.email)
    await Promise.all([
      this.setCache(
        this.getEmailValidationCacheKey(emailValidation.id), emailValidation, this.EMAIL_VALIDATION_TTL
      ),
      this.setCache(
        this.getEmailValidationByEmailCacheKey(emailValidation.email), emailValidation, this.EMAIL_VALIDATION_TTL
      ),
    ])
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
      await this.setCache(cacheKey, validation, this.EMAIL_VALIDATION_TTL)
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
      await this.setCache(cacheKey, validation, this.EMAIL_VALIDATION_TTL)
    }
    return validation
  }

  async delete (id: string): Promise<void> {
    const email = this.validationIdToEmail.get(id)
    await this.emailValidationsRepository.delete(id)
    const invalidations: Promise<void>[] = [
      this.invalidateCache(this.getEmailValidationCacheKey(id)),
    ]
    if (email) {
      invalidations.push(this.invalidateCache(this.getEmailValidationByEmailCacheKey(email)))
    }
    await Promise.all(invalidations)
    this.validationIdToEmail.delete(id)
  }

  private getEmailValidationCacheKey (id: string): string {
    return `email-validation:${id}`
  }

  private getEmailValidationByEmailCacheKey (email: string): string {
    return `email-validation:email:${email}`
  }
}
