import type { EmailValidationsRepository } from '@/domain/application/repositories/email-validations.repository'
import { InMemoryEmailValidationsRepository } from '@/infra/persistence/repositories/in-memory/in-memory-email-validations.repository'
import { VerifyEmailValidationUseCase } from './verify-email-validation.usecase'
import { makeEmailValidation } from '@tests/factories/domain/make-email-validation'

describe('VerifyEmailValidationUseCase', () => {
  let sut: VerifyEmailValidationUseCase
  let emailValidationsRepository: EmailValidationsRepository
  const request = {
    email: 'test@example.com',
    code: '123456',
  }

  beforeEach(() => {
    emailValidationsRepository = new InMemoryEmailValidationsRepository()
    sut = new VerifyEmailValidationUseCase(emailValidationsRepository)
  })

  it('should throw an error if the email validation does not exist', async () => {
    await expect(sut.execute(request)).rejects.toThrowError('No email validation found for this email')
  })

  it('should throw an error if the email validation is expired', async () => {
    const emailValidation = makeEmailValidation({ email: request.email, expiresAt: new Date(Date.now() - 1000) })
    await emailValidationsRepository.save(emailValidation)

    await expect(sut.execute(request)).rejects.toThrowError('Validation code has expired')
  })

  it('should throw an error if the code is invalid', async () => {
    const emailValidation = makeEmailValidation({ email: request.email })
    await emailValidationsRepository.save(emailValidation)

    await expect(sut.execute(request)).rejects.toThrowError('Invalid validation code')
  })

  it('should throw an error if the email is already verified', async () => {
    const emailValidation = makeEmailValidation({ email: request.email, isVerified: true })
    await emailValidationsRepository.save(emailValidation)

    await expect(sut.execute(request)).rejects.toThrowError('This email has already been isVerified')
  })

  it('should throw an error when expiration is 1ms in the past', async () => {
    const pastDate = new Date(Date.now() - 1)
    const emailValidation = makeEmailValidation({ email: request.email, expiresAt: pastDate })
    await emailValidationsRepository.save(emailValidation)

    await expect(sut.execute(request)).rejects.toThrowError('Validation code has expired')
  })

  it('should verify email validation successfully', async () => {
    const emailValidation = makeEmailValidation({ email: request.email })
    await emailValidationsRepository.save(emailValidation)

    await sut.execute({ email: request.email, code: emailValidation.code })

    const verified = await emailValidationsRepository.findByEmail(request.email)
    expect(verified?.isVerified).toBe(true)
  })
})
