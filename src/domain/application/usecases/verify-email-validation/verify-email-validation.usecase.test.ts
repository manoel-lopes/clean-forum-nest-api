import type { EmailValidationsRepository } from '@/domain/application/repositories/email-validations.repository'
import { InMemoryEmailValidationsRepository } from '@/infra/persistence/repositories/in-memory/in-memory-email-validations.repository'
import { makeEmailValidationData } from '@/shared/util/factories/domain/make-email-validation'
import { VerifyEmailValidationUseCase } from './verify-email-validation.usecase'

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
    await emailValidationsRepository.create(
      makeEmailValidationData({ ...request, expiresAt: new Date(Date.now() - 1000) })
    )

    await expect(sut.execute(request)).rejects.toThrowError('Validation code has expired')
  })

  it('should throw an error if the code is invalid', async () => {
    await emailValidationsRepository.create(makeEmailValidationData({ ...request, code: '12345' }))

    await expect(sut.execute(request)).rejects.toThrowError('Invalid validation code')
  })

  it('should throw an error if the code is expired', async () => {
    await emailValidationsRepository.create(
      makeEmailValidationData({ ...request, expiresAt: new Date(Date.now() - 1000) })
    )

    await expect(sut.execute(request)).rejects.toThrowError('Validation code has expired')
  })

  it('should verify email validation successfully', async () => {
    await emailValidationsRepository.create(makeEmailValidationData({ ...request, code: '123456' }))

    await sut.execute(request)

    const emailValidation = await emailValidationsRepository.findByEmail(request.email)
    expect(emailValidation).toBeTruthy()
  })
})
