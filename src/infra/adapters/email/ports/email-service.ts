export type EmailService = {
  sendValidationCode(email: string, code: string): Promise<void>
}

export const EmailService = Symbol('EmailService')
