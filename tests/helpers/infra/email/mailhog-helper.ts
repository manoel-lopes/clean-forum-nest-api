type MailHogMessage = {
  ID: string
  From: {
    Mailbox: string
    Domain: string
  }
  To: Array<{
    Mailbox: string
    Domain: string
  }>
  Content: {
    Headers: Record<string, string[]>
    Body: string
  }
  Created: string
  MIME: unknown
  Raw: {
    From: string
    To: string[]
    Data: string
  }
}

type MailHogResponse = {
  total: number
  count: number
  start: number
  items: MailHogMessage[]
}

function isMailHogResponse (data: unknown): data is MailHogResponse {
  return typeof data === 'object' && data !== null && 'items' in data && Array.isArray(data.items)
}

export abstract class MailHogHelper {
  private static readonly baseUrl = 'http://localhost:8025/api'

  static async getMessages (): Promise<MailHogMessage[]> {
    const response = await fetch(`${this.baseUrl}/v2/messages`)
    const data = (await response.json()) satisfies unknown
    if (!isMailHogResponse(data)) {
      return []
    }
    return data.items
  }

  static async getMessagesByRecipient (email: string): Promise<MailHogMessage[]> {
    const messages = await this.getMessages()
    return messages.filter((msg) => msg.To.some((to) => `${to.Mailbox}@${to.Domain}` === email))
  }

  static async getLatestMessageByRecipient (email: string): Promise<MailHogMessage | null> {
    const messages = await this.getMessagesByRecipient(email)
    return messages.length > 0 ? messages[0] : null
  }

  static async deleteAllMessages () {
    await fetch(`${this.baseUrl}/v1/messages`, {
      method: 'DELETE',
    })
  }

  static extractCodeFromHtml (html: string): string | null {
    const classMatch = html.match(/<p\s+class="verification-code">(\d+)<\/p>/i)
    if (classMatch) {
      return classMatch[1]
    }
    const strongMatch = html.match(/<strong>(\d+)<\/strong>/i)
    if (strongMatch) {
      return strongMatch[1]
    }
    const digitMatch = html.match(/\b\d{6}\b/)
    if (digitMatch) {
      return digitMatch[0]
    }
    return null
  }

  static async waitForEmail (email: string, timeoutMs = 5000): Promise<MailHogMessage> {
    const startTime = Date.now()
    while (Date.now() - startTime < timeoutMs) {
      const message = await this.getLatestMessageByRecipient(email)
      if (message) {
        return message
      }
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
    throw new Error(`Timeout waiting for email to ${email}`)
  }
}

export const mailHog = MailHogHelper
