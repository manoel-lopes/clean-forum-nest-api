import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { Global, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { EnvService } from '@/infra/env/env.service'
import * as schema from './schema'

@Global()
@Injectable()
export class DrizzleService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool
  public db: NodePgDatabase<typeof schema>

  constructor (private readonly envService: EnvService) {}

  async onModuleInit () {
    this.pool = new Pool({
      connectionString: this.envService.get('DATABASE_URL'),
    })
    this.db = drizzle(this.pool, { schema })
  }

  async onModuleDestroy () {
    await this.pool.end()
  }

  getDb () {
    return this.db
  }
}
