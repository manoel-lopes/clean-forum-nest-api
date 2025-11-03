import { z } from 'zod'

type EnvParseErrorMap = { _errors: string[] }

type EnvErrorDetails = EnvParseErrorMap | string[]

type EnvParseError = [string, EnvErrorDetails]

const _env = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']),
    PORT: z
      .string()
      .default('3333')
      .transform((port) => Number(port)),
    DB_HOST: z.string().default('localhost'),
    DB_PORT: z
      .string()
      .default('5432')
      .transform((port) => Number(port)),
    DB_USER: z.string(),
    DB_PASSWORD: z.string(),
    DB_NAME: z.string(),
    REDIS_HOST: z.string().default('localhost'),
    REDIS_PORT: z
      .string()
      .default('6379')
      .transform((port) => Number(port)),
    REDIS_DB: z
      .string()
      .default('0')
      .transform((db) => Number(db)),
    JWT_SECRET: z.string(),
    EMAIL_HOST: z.string(),
    EMAIL_PORT: z.string().transform((port) => (port ? Number(port) : null)),
    EMAIL_USER: z.string(),
    EMAIL_PASS: z.string(),
    EMAIL_FROM: z.string(),
  })
  .transform((data) => ({
    ...data,
    DATABASE_URL: process.env.DATABASE_URL
      ? process.env.DATABASE_URL
      : `postgresql://${data.DB_USER}:${data.DB_PASSWORD}@${data.DB_HOST}:${data.DB_PORT}/${data.DB_NAME}?schema=public`,
  }))
  .safeParse(process.env)
if (!_env.success) {
  const errors: EnvParseError[] = Object.entries(_env.error.format())
  const formattedErrors = formatErrors(errors)
  logEnvErrors(formattedErrors)
  process.exit(1)
}

function formatErrors (errors: EnvParseError[]) {
  return errors.filter(([_, value]) => '_errors' in value).map(([key]) => `${key} is required`)
}

function logEnvErrors (errors: string[]): void {
  console.error('\n\x1b[1m\x1b[31m❌ Invalid environment variables:\x1b[0m')
  errors.forEach((error) => console.error(`- ${error}`))
}

export const env = _env.data
