import { config } from 'dotenv'
import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'node:crypto'
import { execSync } from 'node:child_process'

config({ path: '.env', override: true })
config({ path: '.env.test', override: true })

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

beforeAll(async () => {
  const databaseURL = generateUniqueDatabaseURL(schemaId)

  process.env.DATABASE_URL = databaseURL

  // Create a temp Prisma client to create the schema
  const baseDatabaseURL = process.env.DATABASE_URL?.replace(/\?schema=.*$/, '') || process.env.DATABASE_URL
  const tempPrisma = new PrismaClient({
    datasources: {
      db: {
        url: baseDatabaseURL,
      },
    },
    log: [],
  })

  // Create the schema
  await tempPrisma.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${schemaId}"`)
  await tempPrisma.$disconnect()

  // Run migrations in the new schema
  execSync(`DATABASE_URL="${databaseURL}" pnpm prisma migrate deploy`, { stdio: 'pipe' })

  // Create Prisma client for the test schema
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: databaseURL,
      },
    },
    log: [],
  })
})

afterAll(async () => {
  await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`)
  await prisma.$disconnect()
})
