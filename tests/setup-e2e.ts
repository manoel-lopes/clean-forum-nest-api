import { execSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import pg from 'pg'
import { config } from 'dotenv'
import { PrismaClient } from '@prisma/client'
import { createPrismaClient } from '@/infra/persistence/prisma-client.factory'

config({ path: '.env', override: true })
config({ path: '.env.test', override: true })

process.on('unhandledRejection', (reason) => {
  if (reason instanceof Error && reason.message === 'Connection is closed.') {
    return
  }
})

function generateUniqueDatabaseURL (schemaId: string) {
  const databaseURL = process.env.DATABASE_URL
  if (!databaseURL) {
    throw new Error('Please provide a DATABASE_URL environment variable')
  }
  const url = new URL(databaseURL)
  url.searchParams.set('schema', schemaId)
  return url.toString()
}

const schemaId = randomUUID()
let prisma: PrismaClient
let pool: pg.Pool
beforeAll(async () => {
  const databaseURL = generateUniqueDatabaseURL(schemaId)
  process.env.DATABASE_URL = databaseURL
  const baseDatabaseURL = process.env.DATABASE_URL?.replace(/\?schema=.*$/, '') || process.env.DATABASE_URL
  const { client: tempPrisma, pool: tempPool } = createPrismaClient(baseDatabaseURL)
  await tempPrisma.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${schemaId}"`)
  await tempPrisma.$disconnect()
  await tempPool.end()
  execSync(`DATABASE_URL="${databaseURL}" pnpm prisma migrate deploy`, { stdio: 'pipe' })
  process.env.DATABASE_URL = databaseURL
  const result = createPrismaClient(databaseURL)
  prisma = result.client
  pool = result.pool
})

afterAll(async () => {
  await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`)
  await prisma.$disconnect()
  await pool.end()
})
