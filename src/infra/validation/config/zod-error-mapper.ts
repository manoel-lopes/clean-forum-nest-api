import { z } from 'zod'

type Label = {
  bare: string
  quoted: string
}

type RawIssue = {
  code: string
  path: Array<string | number>
  input?: unknown
  expected?: string
  minimum?: number
  maximum?: number
  format?: string
  message?: string
}

type MessageBuilder = (issue: RawIssue, label: Label) => string

export abstract class ZodErrorMapper {
  private static readonly DEFAULT_ERROR = 'Invalid input'
  private static readonly ERROR_BUILDERS: Record<string, MessageBuilder> = {
    invalid_type: ZodErrorMapper.buildInvalidTypeMessage.bind(ZodErrorMapper),
    too_small: ZodErrorMapper.buildTooSmallMessage.bind(ZodErrorMapper),
    too_big: ZodErrorMapper.buildTooBigMessage.bind(ZodErrorMapper),
    invalid_format: ZodErrorMapper.buildInvalidFormatMessage.bind(ZodErrorMapper),
    custom: ZodErrorMapper.buildCustomMessage.bind(ZodErrorMapper),
  }

  static setErrorMap (): void {
    z.config({
      customError: (issue) => ZodErrorMapper.format(issue),
    })
  }

  static format (issue: unknown): string {
    if (!ZodErrorMapper.isRawIssue(issue)) return ZodErrorMapper.DEFAULT_ERROR
    return ZodErrorMapper.buildMessage(issue)
  }

  private static isRawIssue (issue: unknown): issue is RawIssue {
    return (
      typeof issue === 'object' &&
      issue !== null &&
      'code' in issue &&
      'path' in issue
    )
  }

  private static buildMessage (issue: RawIssue): string {
    const label = ZodErrorMapper.getLabel(issue)
    const builder = ZodErrorMapper.ERROR_BUILDERS[issue.code]
    if (builder) {
      return builder(issue, label)
    }
    return issue.message || ZodErrorMapper.DEFAULT_ERROR
  }

  private static getLabel (issue: RawIssue): Label {
    const field = issue.path[issue.path.length - 1]
    if (typeof field === 'string') {
      return { bare: field, quoted: `'${field}'` }
    }
    return { bare: 'value', quoted: 'value' }
  }

  private static getInputDescription (input: unknown): string {
    if (input === undefined) return 'undefined'
    if (input === null) return 'null'
    if (Array.isArray(input)) return 'array'
    return typeof input
  }

  private static buildInvalidTypeMessage (issue: RawIssue, label: Label): string {
    const received = ZodErrorMapper.getInputDescription(issue.input)
    if (received === 'undefined') {
      return `The ${label.bare} is required`
    }
    return `Expected ${issue.expected} for ${label.quoted}, received ${received}`
  }

  private static buildTooSmallMessage (issue: RawIssue, label: Label): string {
    const min = Number(issue.minimum) || 0
    return `The ${label.quoted} must contain at least ${min} characters`
  }

  private static buildTooBigMessage (issue: RawIssue, label: Label): string {
    const max = Number(issue.maximum) || 0
    return `The ${label.quoted} must contain at most ${max} characters`
  }

  private static buildInvalidFormatMessage (issue: RawIssue, label: Label): string {
    const formatMessages: Record<string, string> = {
      email: `The ${label.quoted} must be a valid email address`,
      uuid: `The ${label.quoted} must be a valid UUID`,
      url: `The ${label.quoted} must be a valid URL`,
    }
    return formatMessages[issue.format || ''] || `The ${label.quoted} has an invalid format`
  }

  private static buildCustomMessage (issue: RawIssue, _label: Label): string {
    return issue.message || ZodErrorMapper.DEFAULT_ERROR
  }
}
