export type EmailService = {
  sendValidationCode(email: string, code: string): Promise<void>
}
