import type { EmailValidationsRepository } from '@/domain/application/repositories/email-validations.repository'
import { InMemoryEmailValidationsRepository } from '@/infra/persistence/repositories/in-memory/in-memory-email-validations.repository'
import { VerifyEmailUseCase } from './verify-email.usecase'
import { makeEmailValidationData } from '@tests/factories/domain/make-email-validation'

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
    await emailValidationsRepository.create(
      makeEmailValidationData({ ...request, expiresAt: new Date(Date.now() - 1000) })
    )

    await expect(sut.execute(request)).rejects.toThrowError('The code has expired')
  })

  it('should throw an error if the code is invalid', async () => {
    await emailValidationsRepository.create(makeEmailValidationData({ ...request, code: '654321' }))

    await expect(sut.execute(request)).rejects.toThrowError('The code is invalid')
  })

  it('should return early if the email is already verified (idempotent)', async () => {
    await emailValidationsRepository.create(
      makeEmailValidationData({ ...request, isVerified: true })
    )

    await expect(sut.execute(request)).resolves.toBeUndefined()
  })

  it('should throw an error when expiration is 1ms in the past', async () => {
    const pastDate = new Date(Date.now() - 1)
    await emailValidationsRepository.create(
      makeEmailValidationData({ ...request, expiresAt: pastDate })
    )

    await expect(sut.execute(request)).rejects.toThrowError('The code has expired')
  })

  it('should verify email validation successfully', async () => {
    await emailValidationsRepository.create(makeEmailValidationData({ ...request, code: '123456' }))

    await sut.execute(request)

    const emailValidation = await emailValidationsRepository.findByEmail(request.email)
    expect(emailValidation?.isVerified).toBe(true)
  })
})
