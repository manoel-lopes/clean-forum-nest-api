import type { EmailValidationsRepository } from '@/domain/application/repositories/email-validations.repository'
import { InMemoryEmailValidationsRepository } from '@/infra/persistence/repositories/in-memory/in-memory-email-validations.repository'
import { VerifyEmailUseCase } from './verify-email.usecase'
import { makeEmailValidation } from '@tests/factories/domain/make-email-validation'

describe('VerifyEmailUseCase', () => {
  let sut: VerifyEmailUseCase
  let emailValidationsRepository: EmailValidationsRepository
  const request = {
    email: 'test@example.com',
    code: '123456',
  }

  beforeEach(() => {
    emailValidationsRepository = new InMemoryEmailValidationsRepository()
    sut = new VerifyEmailUseCase(emailValidationsRepository)
  })

  it('should throw an error if the email validation does not exist', async () => {
    await expect(sut.execute(request)).rejects.toThrowError('No email validation found for the email: test@example.com')
  })

  it('should throw an error if the email validation is expired', async () => {
    const emailValidation = makeEmailValidation({ email: request.email, expiresAt: new Date(Date.now() - 1000) })
    await emailValidationsRepository.save(emailValidation)

    await expect(sut.execute(request)).rejects.toThrowError('The code has expired')
  })

  it('should throw an error if the code is invalid', async () => {
    const emailValidation = makeEmailValidation({ email: request.email })
    await emailValidationsRepository.save(emailValidation)

    await expect(sut.execute(request)).rejects.toThrowError('The code is invalid')
  })

  it('should return early if the email is already verified (idempotent)', async () => {
    const emailValidation = makeEmailValidation({ email: request.email, isVerified: true })
    await emailValidationsRepository.save(emailValidation)

    await expect(sut.execute(request)).resolves.toBeUndefined()
  })

  it('should throw an error when expiration is 1ms in the past', async () => {
    const pastDate = new Date(Date.now() - 1)
    const emailValidation = makeEmailValidation({ email: request.email, expiresAt: pastDate })
    await emailValidationsRepository.save(emailValidation)

    await expect(sut.execute(request)).rejects.toThrowError('The code has expired')
  })

  it('should verify email validation successfully', async () => {
    const emailValidation = makeEmailValidation({ email: request.email })
    await emailValidationsRepository.save(emailValidation)

    await sut.execute({ email: request.email, code: emailValidation.code })

    const verified = await emailValidationsRepository.findByEmail(request.email)
    expect(verified?.isVerified).toBe(true)
  })
})
