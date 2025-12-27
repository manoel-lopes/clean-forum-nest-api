import { Inject, Injectable } from '@nestjs/common'
import type {
  EmailValidationsRepository,
  UpdateEmailValidationData,
} from '@/domain/application/repositories/email-validations.repository'
import { CacheTTL } from '@/infra/cache/cache-ttl'
import { RedisCacheService } from '@/infra/cache/redis-cache.service'
import type { EmailValidation } from '@/domain/enterprise/entities/email-validation.entity'
import { BaseCachedRepository } from './base/base-cached.repository'

export const TypeOrmEmailValidationsRepositoryToken = Symbol('TypeOrmEmailValidationsRepositoryToken')

@Injectable()
export class CachedEmailValidationsRepository
  extends BaseCachedRepository
  implements EmailValidationsRepository {
  private readonly cacheKeys = {
    emailValidation: (id: string) => `email-validation:${id}`,
    emailValidationByEmail: (email: string) => `email-validation:email:${email}`,
  }

  constructor (
    protected readonly cacheService: RedisCacheService,
    @Inject(TypeOrmEmailValidationsRepositoryToken)
    private readonly emailValidationsRepository: EmailValidationsRepository
  ) {
    super(cacheService)
  }

  async save (emailValidation: EmailValidation): Promise<void> {
    await this.emailValidationsRepository.save(emailValidation)
    await this.setCache(this.cacheKeys.emailValidation(emailValidation.id), emailValidation, CacheTTL.EMAIL_VALIDATION)
    await this.setCache(
      this.cacheKeys.emailValidationByEmail(emailValidation.email),
      emailValidation,
      CacheTTL.EMAIL_VALIDATION
    )
  }

  async update (emailValidationData: UpdateEmailValidationData): Promise<EmailValidation> {
    const emailValidation = await this.emailValidationsRepository.update(emailValidationData)
    await this.setCache(this.cacheKeys.emailValidation(emailValidation.id), emailValidation, CacheTTL.EMAIL_VALIDATION)
    await this.setCache(
      this.cacheKeys.emailValidationByEmail(emailValidation.email),
      emailValidation,
      CacheTTL.EMAIL_VALIDATION
    )
    return emailValidation
  }

  async findByEmail (email: string): Promise<EmailValidation | null> {
    const cacheKey = this.cacheKeys.emailValidationByEmail(email)
    const cached = await this.getFromCache<EmailValidation>(cacheKey)
    if (cached) return cached
    const validation = await this.emailValidationsRepository.findByEmail(email)
    if (validation) await this.setCache(cacheKey, validation, CacheTTL.EMAIL_VALIDATION)
    return validation
  }

  async findById (id: string): Promise<EmailValidation | null> {
    const cacheKey = this.cacheKeys.emailValidation(id)
    const cached = await this.getFromCache<EmailValidation>(cacheKey)
    if (cached) return cached
    const validation = await this.emailValidationsRepository.findById(id)
    if (validation) await this.setCache(cacheKey, validation, CacheTTL.EMAIL_VALIDATION)
    return validation
  }

  async delete (id: string): Promise<void> {
    const emailValidation = await this.emailValidationsRepository.findById(id)
    await this.emailValidationsRepository.delete(id)
    await this.invalidateCache(this.cacheKeys.emailValidation(id))
    if (emailValidation?.email) {
      await this.invalidateCache(this.cacheKeys.emailValidationByEmail(emailValidation.email))
    }
  }
}
