import pg from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

export type PrismaAdapterWithPool = {
  adapter: PrismaPg
  pool: pg.Pool
}

export type PrismaClientWithPool = {
  client: PrismaClient
  pool: pg.Pool
}

export function createPrismaAdapter (connectionString: string): PrismaAdapterWithPool {
  const pool = new pg.Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  return { adapter, pool }
}

export function createPrismaClient (connectionString: string): PrismaClientWithPool {
  const { adapter, pool } = createPrismaAdapter(connectionString)
  const client = new PrismaClient({ adapter })
  return { client, pool }
}
