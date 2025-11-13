import type { EmailValidationsRepository } from '@/domain/application/repositories/email-validations.repository'
import { EmailServiceStub } from '@/infra/adapters/email/email-service.stub'
import { InMemoryEmailValidationsRepository } from '@/infra/persistence/repositories/in-memory/in-memory-email-validations.repository'
import type { EmailService } from '@/infra/adapters/email/ports/email-service'
import { SendEmailValidationError } from './errors/send-email-validation.error'
import { SendEmailValidationUseCase } from './send-email-validation.usecase'

describe('SendEmailValidationUseCase', () => {
  let emailValidationsRepository: EmailValidationsRepository
  let emailService: EmailService
  let sut: SendEmailValidationUseCase
  beforeEach(() => {
    emailValidationsRepository = new InMemoryEmailValidationsRepository()
    emailService = new EmailServiceStub()
    sut = new SendEmailValidationUseCase(emailValidationsRepository, emailService)
  })

  it('should send email validation successfully', async () => {
    const request = { email: 'jhondoe@example.com' }

    await expect(sut.execute(request)).resolves.not.toThrow()
  })

  it('should throw an error when email service fails', async () => {
    const request = { email: 'jhondoe@example.com' }
    const error = new SendEmailValidationError('Email service error')
    vi.spyOn(emailService, 'sendValidationCode').mockRejectedValue(error)

    await expect(sut.execute(request)).rejects.toThrow(error)
  })

  it('should set email validation expiry to 10 minutes from now', async () => {
    const request = { email: 'jhondoe@example.com' }
    const startTime = new Date()

    await sut.execute(request)

    const savedEmailValidation = await emailValidationsRepository.findByEmail(request.email)
    const expectedExpiry = new Date(startTime)
    expectedExpiry.setMinutes(expectedExpiry.getMinutes() + 10)
    const timeDiffMs = Math.abs(savedEmailValidation!.expiresAt.getTime() - expectedExpiry.getTime())
    expect(timeDiffMs).toBeLessThan(1000)
  })

  it('should save email validation with correct data', async () => {
    const request = { email: 'jhondoe@example.com' }

    await sut.execute(request)

    const savedEmailValidation = await emailValidationsRepository.findByEmail(request.email)
    expect(savedEmailValidation?.code).toBeDefined()
    expect(savedEmailValidation?.expiresAt).toBeInstanceOf(Date)
    expect(savedEmailValidation?.email).toBe(request.email)
    expect(typeof savedEmailValidation?.code).toBe('string')
    expect(savedEmailValidation?.code).toHaveLength(6)
    expect(savedEmailValidation?.isVerified).toBe(false)
  })
})
