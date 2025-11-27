import { PrismaClient } from '@prisma/client'

const nodeEnv = process.env.NODE_ENV || 'development'
const log: Record<string, ('query' | 'info' | 'warn' | 'error')[]> = {
  development: ['query'],
  production: ['error', 'warn'],
  test: [],
}

export const prisma = new PrismaClient({
  log: log[nodeEnv],
})
