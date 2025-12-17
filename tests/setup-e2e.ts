import { execSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { config } from 'dotenv'
import { Pool } from 'pg'

config({ path: '.env', override: true })
config({ path: '.env.test', override: true })

process.on('unhandledRejection', (reason) => {
  if (reason instanceof Error && reason.message === 'Connection is closed.') {
    return
  }
  throw reason
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

let schemaId: string
let pool: Pool

beforeAll(async () => {
  schemaId = randomUUID()
  const databaseURL = generateUniqueDatabaseURL(schemaId)
  process.env.DATABASE_URL = databaseURL

  const baseDatabaseURL = databaseURL.replace(/\?schema=.*$/, '')
  pool = new Pool({ connectionString: baseDatabaseURL })
  await pool.query(`CREATE SCHEMA IF NOT EXISTS "${schemaId}"`)
  await pool.end()

  execSync(`DATABASE_URL="${databaseURL}" pnpm prisma migrate deploy`, { stdio: 'pipe' })
  pool = new Pool({ connectionString: databaseURL })
})

afterAll(async () => {
  await pool.query(`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`)
  await pool.end()
})
